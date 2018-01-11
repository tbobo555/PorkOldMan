package main

import (
    "net/http"
    "log"
    "porkoldman/core/controller"
    "github.com/gorilla/mux"
    "porkoldman/core/config"
)

func main() {
    router := mux.NewRouter()
    // test example
    router.HandleFunc("/", controller.IndexServe)
    router.HandleFunc("/{id:[0-9]+}", controller.IndexServe).Methods("GET")

    // game downstairs router
    router.HandleFunc("/game/downstairs", controller.TestingDownStairs).Methods("GET")
    router.HandleFunc("/io/game/downstairs/{token}", controller.TestingDownStairsSocket).Methods("GET"). Headers("Connection", "Upgrade").Headers("Upgrade", "websocket")
    router.PathPrefix("/game/assets/").Handler(http.StripPrefix("/game/", http.FileServer(http.Dir(config.PublicPath))))
    http.Handle("/", router)
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal("occur error here: ", err.Error())
    }
}
