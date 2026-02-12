package main

import (
	"net/http"
	"fmt"
	"log"
	"encoding/json"

	"github.com/RohitSapkota/voice-todo-agent/providers/gemini"
)

type Request struct {
	Text string `json:"text"`
}

func requestHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var newRequest Request
	err := json.NewDecoder(r.Body).Decode(&newRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	gemini.TextToText(newRequest.Text)
}

func main() {
	http.HandleFunc("/text", requestHandler)

	fmt.Println(("Server starting on Port 8000..."))

	if err := http.ListenAndServe(":8000", nil); err != nil {
		log.Fatal(err)
	}
}
