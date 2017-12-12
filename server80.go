package main

import (
    "net/http"
    "log"
    "porkoldman/core/controller"
    "github.com/gorilla/mux"
)

func main() {
    router := mux.NewRouter()
    // test example
    router.HandleFunc("/", controller.IndexServe)
    router.HandleFunc("/{id:[0-9]+}", controller.IndexServe).Methods("GET")

    // game downstairs router
    router.HandleFunc("/game/downstairs", controller.GameDownStairsServeGet).Methods("GET")
    router.HandleFunc("/io/game/downstairs/{token}", controller.IoGameDownStairsServeSocket).Methods("GET").
        Headers("Connection", "Upgrade").Headers("Upgrade", "websocket")
    router.PathPrefix("/game/assets/").Handler(http.StripPrefix("/game/", http.FileServer(http.Dir("./public"))))
    http.Handle("/", router)
    err := http.ListenAndServe(":8000", nil)
    if err != nil {
        log.Fatal("occur error here: ", err.Error())
    }
}
