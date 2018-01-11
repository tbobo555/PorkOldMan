package main

import (
    "log"
    "github.com/gorilla/mux"
    "porkoldman/core/controller"
    "net/http"
)

func main() {
    controller.FilePath = "./"
    router := mux.NewRouter()
    router.PathPrefix("/assets").Handler(http.StripPrefix("/assets", http.FileServer(http.Dir("./assets"))))
    router.HandleFunc("/", controller.DownStairs)
    http.Handle("/", router)
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal("occur error here: ", err.Error())
    }
}
