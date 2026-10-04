use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{Duration, Instant};

use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tokio::sync::{mpsc, oneshot};

use hubbub_domain::entities::document::Document;
use hubbub_domain::ports::workspace_service::WorkspaceService;

use crate::errors::WorkspaceError;

/// Trait for receiving indexed document events from the watcher.
pub trait WorkspaceWatcherSink: Send + Sync {
    fn on_document_indexed(&self, doc: Document);
}

/// Active filesystem watcher for workspace directories.
pub struct WorkspaceWatcher {
    _watcher: RecommendedWatcher,
    shutdown_tx: Option<oneshot::Sender<()>>,
    handle: Option<tokio::task::JoinHandle<()>>,
}

impl WorkspaceWatcher {
    /// Start watching the workspace root directory recursively.
    pub fn start(
        root: &Path,
        service: Arc<dyn WorkspaceService>,
        sink: Arc<dyn WorkspaceWatcherSink>,
    ) -> Result<Self, WorkspaceError> {
        let (event_tx, mut event_rx) = mpsc::unbounded_channel::<PathBuf>();
        let (shutdown_tx, mut shutdown_rx) = oneshot::channel::<()>();

        let root_for_watcher = root.to_path_buf();
        let mut watcher = RecommendedWatcher::new(
            move |res: notify::Result<Event>| {
                if let Ok(event) = res {
                    Self::handle_fs_event(&root_for_watcher, event, &event_tx);
                }
            },
            Config::default(),
        )
        .map_err(|e| WorkspaceError::Watcher(e.to_string()))?;

        watcher
            .watch(root, RecursiveMode::Recursive)
            .map_err(|e| WorkspaceError::Watcher(e.to_string()))?;

        let root_clone = root.to_path_buf();
        let handle = tokio::spawn(async move {
            Self::event_loop(root_clone, service, sink, &mut event_rx, &mut shutdown_rx).await;
        });

        Ok(Self {
            _watcher: watcher,
            shutdown_tx: Some(shutdown_tx),
            handle: Some(handle),
        })
    }

    fn handle_fs_event(root: &Path, event: Event, event_tx: &mpsc::UnboundedSender<PathBuf>) {
        match event.kind {
            EventKind::Create(_) | EventKind::Modify(_) => {
                for path in event.paths {
                    if Self::is_watchable_path(root, &path) {
                        let _ = event_tx.send(path);
                    }
                }
            }
            _ => {}
        }
    }

    /// Check if path should be indexed (only markdown/text, no hidden/temp/versions).
    fn is_watchable_path(root: &Path, path: &Path) -> bool {
        let norm_path = path.to_string_lossy().replace('\\', "/");
        let norm_root = root.to_string_lossy().replace('\\', "/");
        let norm_root_trimmed = norm_root.trim_end_matches('/');

        let rel_str = if let Ok(rel) = path.strip_prefix(root) {
            rel.to_string_lossy().replace('\\', "/")
        } else if let Some(stripped) = norm_path.strip_prefix(norm_root_trimmed) {
            stripped.trim_start_matches('/').to_string()
        } else {
            return false;
        };

        let rel_path = Path::new(&rel_str);
        for comp in rel_path.components() {
            let s = comp.as_os_str().to_string_lossy();
            if s.starts_with('.') || s == ".versions" {
                return false;
            }
        }

        matches!(path.extension().and_then(|ext| ext.to_str()), Some("md") | Some("txt"))
    }

    async fn event_loop(
        root: PathBuf,
        service: Arc<dyn WorkspaceService>,
        sink: Arc<dyn WorkspaceWatcherSink>,
        rx: &mut mpsc::UnboundedReceiver<PathBuf>,
        shutdown: &mut oneshot::Receiver<()>,
    ) {
        let mut pending: HashMap<PathBuf, Instant> = HashMap::new();
        let mut interval = tokio::time::interval(Duration::from_millis(100));

        loop {
            tokio::select! {
                _ = &mut *shutdown => {
                    break;
                }
                Some(path) = rx.recv() => {
                    let deadline = Instant::now() + Duration::from_millis(200);
                    pending.insert(path, deadline);
                }
                _ = interval.tick() => {
                    Self::process_pending_paths(&root, &service, &sink, &mut pending).await;
                }
            }
        }
    }

    async fn process_pending_paths(
        root: &Path,
        service: &Arc<dyn WorkspaceService>,
        sink: &Arc<dyn WorkspaceWatcherSink>,
        pending: &mut HashMap<PathBuf, Instant>,
    ) {
        let now = Instant::now();
        let ready_paths: Vec<PathBuf> = pending
            .iter()
            .filter(|(_, deadline)| now >= **deadline)
            .map(|(path, _)| path.clone())
            .collect();

        for path in ready_paths {
            pending.remove(&path);
            if service.is_recent_self_write(&path).await {
                continue;
            }
            if !path.exists() || !path.is_file() {
                continue;
            }

            let norm_path = path.to_string_lossy().replace('\\', "/");
            let norm_root = root.to_string_lossy().replace('\\', "/");
            let norm_root_trimmed = norm_root.trim_end_matches('/');

            let rel_str = if let Ok(rel) = path.strip_prefix(root) {
                rel.to_string_lossy().replace('\\', "/")
            } else if let Some(stripped) = norm_path.strip_prefix(norm_root_trimmed) {
                stripped.trim_start_matches('/').to_string()
            } else {
                continue;
            };

            if let Ok(Some(doc)) = service.reindex_file(&rel_str).await {
                sink.on_document_indexed(doc);
            }
        }
    }

    /// Stop the background watcher and await task completion.
    pub async fn stop(mut self) {
        if let Some(tx) = self.shutdown_tx.take() {
            let _ = tx.send(());
        }
        if let Some(handle) = self.handle.take() {
            let _ = handle.await;
        }
    }
}

impl Drop for WorkspaceWatcher {
    fn drop(&mut self) {
        if let Some(tx) = self.shutdown_tx.take() {
            let _ = tx.send(());
        }
    }
}
