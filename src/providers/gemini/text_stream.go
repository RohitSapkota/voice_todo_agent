package gemini

import (
	"context"
	"log"
	"os"

	"google.golang.org/genai"
)

func TextToTextStream(input string) string {
	ctx := context.Background()

	apiKey, ok := os.LookupEnv("GEMINI_API_KEY")
	if !ok || apiKey == "" {
		log.Println("GEMINI_API_KEY is not set")
		return "API Key not set."
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Printf("failed to create Gemini client: %v", err)
		return "Gemini Clinet error."
	}

	stream := client.Models.GenerateContentStream(
		ctx,
		"gemini-3-flash-preview",
		genai.Text(input),
		nil,
	)

	text := ""

	for chunk, err := range stream {
		if err != nil {
			log.Printf("stream error: %v", err)
			continue
		}
		if chunk == nil {
			continue
		}
		chunkText := chunk.Text()
		if chunkText == "" {
			continue
		}
		text += chunkText
	}
	return text
}
