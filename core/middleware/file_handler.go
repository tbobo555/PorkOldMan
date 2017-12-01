package middleware

import (
    "os"
    "strings"
    "io"
)

const ReadBufferSize  = 1024

type FileHandler struct {}

func (f *FileHandler) IsExist(path string) bool{
    _, err := os.Stat(path)
    if os.IsNotExist(err) {
        return false
    }
    return true
}

func (f *FileHandler) CreateFile(path string) error {
    if f.IsExist(path) == false {
        var file, err = os.Create(path)
        if err != nil {
            return err
        }
        defer file.Close()
    }
    return nil
}

func (f *FileHandler) WriteFile(path string, text string) error {
    // open file using READ & WRITE permission
    var file, err = os.OpenFile(path, os.O_RDWR, 0644)
    if err != nil {
        return err
    }
    defer file.Close()
    lines := strings.Split(text, "\n")
    for _, line := range lines {
        _, err = file.WriteString(line + "\n")
        if err != nil {
            return err
        }
    }
    // save changes
    err = file.Sync()
    if err != nil {
        return err
    }
    return nil
}

func (f *FileHandler) DeleteFile(path string) error {
    var err = os.Remove(path)
    if err != nil {
        return  err
    }
    return nil
}

func (f *FileHandler) ReadFile(path string) ([]byte, error) {
    // re-open file
    var file, err = os.OpenFile(path, os.O_RDWR, 0644)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    // read file, line by line
    var text = make([]byte, ReadBufferSize)
    for {
        _, err = file.Read(text)
        if err == io.EOF {
            break
        }
        if err != nil && err != io.EOF {
            return nil, err
        }
    }
    return text, err
}
