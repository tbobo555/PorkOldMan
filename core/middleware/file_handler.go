package middleware

import (
    "os"
    "strings"
    "io"
    "sync"
    "io/ioutil"
)

var fileMutex sync.RWMutex

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

// 將原始檔案的資料清空，並以新資料寫入
func (f *FileHandler) CoverFile(path string, text string, wrap bool) error {
    fileMutex.Lock()
    defer fileMutex.Unlock()
    if wrap {
        text = text + "\n"
    }
    return ioutil.WriteFile(path, []byte(text), 0644)
}

// 將資料寫入檔案(添加在檔案末端)，寫完後會自動換行
func (f *FileHandler) WriteFile(path string, text string) error {
    var file, err = os.OpenFile(path, os.O_APPEND|os.O_WRONLY, 0644)
    if err != nil {
        return err
    }
    defer file.Close()
    lines := strings.Split(text, "\n")
    fileMutex.Lock()
    defer fileMutex.Unlock()
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
    fileMutex.RLock()
    defer fileMutex.RUnlock()

    var err = os.Remove(path)
    if err != nil {
        return  err
    }
    return nil
}

// 讀取檔案
func (f *FileHandler) ReadFile(path string) ([]byte, error) {
    fileMutex.RLock()
    defer fileMutex.RUnlock()

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
