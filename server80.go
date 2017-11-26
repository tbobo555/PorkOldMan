package main

import (
    "net/http"
    "log"
    "porkoldman/core/controller"
    "porkoldman/core/block/downstairs"
)

func main() {
    go downstairs.RunEngine()
    http.HandleFunc("/", controller.HomeServeGet)
    http.HandleFunc("/io/game/downstairs", controller.IoGameDownStairsServeSocket)
    http.Handle("/assets/", http.FileServer(http.Dir("./public/")))
    err := http.ListenAndServe(":8000", nil)
    if err != nil {
        log.Fatal("occur error here: ", err.Error())
    }
}
