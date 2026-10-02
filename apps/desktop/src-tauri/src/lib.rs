//! Hubbub Desktop — Tauri application shell.
//!
//! This is a thin shell that:
//! - Sets up the Tauri window and IPC
//! - Delegates all business logic to `hubbub-app` crate
//! - Contains no business logic itself

/// Tauri IPC command: health check.
#[tauri::command]
fn health_check() -> String {
    "Hubbub is running".to_string()
}

/// Tauri IPC command: get app version.
#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![health_check, get_version])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            eprintln!("Failed to start Hubbub: {e}");
            std::process::exit(1);
        });
}
