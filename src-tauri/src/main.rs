#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

fn main() {
  // must be initialized first
  let logger = cabr2_logger::plugin::Logger::new();

  let config = cabr2_config::plugin::Config::default();
  let search = cabr2_search::plugin::Search::new();
  let load_save = cabr2_load_save::plugin::LoadSave::new(search.get_provider_mapping());

  log::debug!("initializing tauri application...");

  tauri::Builder::default()
    .plugin(logger)
    .plugin(config)
    .plugin(search)
    .plugin(load_save)
    .setup(|_| {
      log::debug!("tauri setup complete");
      Ok(())
    })
    .run(tauri::generate_context!())
    .unwrap();
}


#[cfg(all(feature = "tauri_app", feature = "webserver"))]
compile_error!("you can only use one of these features: 'tauri_app', 'webserver'!");

#[cfg(feature = "webserver")]
fn main() {
  unimplemented!();
}
