package core

import (
    "fmt"
    "errors"
    "github.com/davecgh/go-spew/spew"
)

// 利用含式名稱與參數組成error string
func CommonError(funcName string , input interface{}, err error) error {
    if err != nil {
        return errors.New(fmt.Sprintf("call %s error, info: %s, input: %s",
            funcName, err.Error(), spew.Sprint(input)))
    }
    return errors.New(fmt.Sprintf("call %s error, input: %s, with no error info", funcName, input))
}
