package _interface

import "net/http"

type Block interface {
    Load(writer http.ResponseWriter, request *http.Request) (int, error)
    Response() (map[interface{}] interface{}, error)
}
