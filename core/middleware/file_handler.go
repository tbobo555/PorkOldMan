package middleware

import (
    "os"
    "strings"
    "io"
)

type FileHandler struct {}

// 檢查檔案是否存在
func (f *FileHandler) IsExist(path string) bool{
    _, err := os.Stat(path)
    if os.IsNotExist(err) {
        return false
    }
    return true
}

// 建立檔案，若檔案已存在則不建立
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

// 將資料寫入檔案(添加在檔案末端)，寫完後會自動換行
func (f *FileHandler) WriteFile(path string, text string) error {
    var file, err = os.OpenFile(path, os.O_APPEND|os.O_WRONLY, 0644)
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

// 刪除檔案
func (f *FileHandler) DeleteFile(path string) error {
    var err = os.Remove(path)
    if err != nil {
        return  err
    }
    return nil
}

// 讀取檔案
func (f *FileHandler) ReadFile(path string) ([]byte, error) {
    // open file
    var file, err = os.OpenFile(path, os.O_RDWR, 0644)
    if err != nil {
        return nil, err
    }
    defer file.Close()
    // get file info
    info, err := os.Stat(path)
    if err != nil {
        return nil, err
    }
    fileLength := info.Size()

    // read file, line by line
    var text = make([]byte, fileLength)
    for {
        _, err = file.Read(text)
        if err == io.EOF {
            break
        }
        if err != nil && err != io.EOF {
            return nil, err
        }
    }
    return text, nil
}
