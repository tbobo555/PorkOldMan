package main

import (
	"net/http"
	"log"
	"porkoldman/core/controller"
	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	router.PathPrefix("/game/assets/").Handler(http.StripPrefix("/game/", http.FileServer(http.Dir("./public"))))
	// game downstairs router
	router.HandleFunc("/game/downstairs", controller.GameServe).Methods("GET")
	http.Handle("/", router)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("occur error here: ", err.Error())
	}
}
