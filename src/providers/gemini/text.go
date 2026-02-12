package gemini

import (
	"context"
	"fmt"
	"log"
	"os"

	"google.golang.org/genai"
)

func TextToText(input string) {
	ctx := context.Background()

	apiKey, ok := os.LookupEnv("GEMINI_API_KEY")
	if !ok || apiKey == "" {
		log.Println("GEMINI_API_KEY is not set")
		return
	}
	fmt.Println("API key set")

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Printf("failed to create Gemini client: %v", err)
		return
	}

	stream := client.Models.GenerateContentStream(
		ctx,
		"gemini-3-flash-preview",
		genai.Text(input),
		nil,
	)

	for chunk, err := range stream {
		if err != nil {
			log.Printf("stream error: %v", err)
			continue
		}
		if chunk == nil {
			continue
		}
		text := chunk.Text()
		if text == "" {
			continue
		}
		fmt.Print(text)
	}
}
