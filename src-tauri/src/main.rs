#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
async fn pick_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || app.dialog().file().blocking_pick_folder().map(|p| p.to_string()))
        .await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn open_project(app: tauri::AppHandle) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let Some(file) = app.dialog().file().add_filter("jidwat project", &["json"]).blocking_pick_file() else { return Ok(None) };
        let path = file.into_path().map_err(|e| e.to_string())?;
        let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
        if bytes.len() > 2_000_000 { return Err("Project file is too large".into()); }
        String::from_utf8(bytes).map(Some).map_err(|e| e.to_string())
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
async fn save_project(app: tauri::AppHandle, content: String) -> Result<bool, String> {
    if content.len() > 2_000_000 { return Err("Project file is too large".into()); }
    serde_json::from_str::<serde_json::Value>(&content).map_err(|e| e.to_string())?;
    tauri::async_runtime::spawn_blocking(move || {
        let Some(file) = app.dialog().file().set_file_name("Project.jidwat.json").add_filter("jidwat project", &["json"]).blocking_save_file() else { return Ok(false) };
        std::fs::write(file.into_path().map_err(|e| e.to_string())?, content).map_err(|e| e.to_string())?;
        Ok(true)
    }).await.map_err(|e| e.to_string())?
}

fn main() {
    tauri::Builder::default().plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![pick_folder, open_project, save_project])
        .run(tauri::generate_context!()).expect("Unable to launch jidwat");
}


