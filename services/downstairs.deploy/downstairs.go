package downstairs_deploy

import (
	"net/http"
    "porkoldman/core/controller"
    "github.com/gorilla/mux"
)

func init() {
    controller.FilePath = "./"
    router := mux.NewRouter()
    router.PathPrefix("/assets").Handler(http.StripPrefix("/assets", http.FileServer(http.Dir("./assets"))))
    router.HandleFunc("/", controller.DownStairs)
    http.Handle("/", router)
}
