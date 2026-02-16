package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/RohitSapkota/voice-todo-agent/providers/gemini"
)

type Request struct {
	Text string `json:"text"`
}

type Response struct {
	Response string `json:"response,omitempty"`
	Error    string `json:"error,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, payload Response) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("failed to encode response: %v", err)
	}
}

func requestHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, Response{Error: "Method not allowed"})
		return
	}

	var newRequest Request
	err := json.NewDecoder(r.Body).Decode(&newRequest)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, Response{Error: err.Error()})
		return
	}

	text := strings.TrimSpace(newRequest.Text)
	if text == "" {
		writeJSON(w, http.StatusBadRequest, Response{Error: "Missing text."})
		return
	}

	result, err := gemini.TextToText(text)
	if err != nil {
		log.Printf("text generation failed: %v", err)
		writeJSON(w, http.StatusBadGateway, Response{Error: "Failed to generate response."})
		return
	}

	result = strings.TrimSpace(result)
	if result == "" {
		writeJSON(w, http.StatusBadGateway, Response{Error: "Empty response from Gemini."})
		return
	}

	writeJSON(w, http.StatusOK, Response{Response: result})
}

func main() {
	http.HandleFunc("/audio", requestHandler)

	fmt.Println(("Server starting on Port 8000..."))

	if err := http.ListenAndServe(":8000", nil); err != nil {
		log.Fatal(err)
	}
}
