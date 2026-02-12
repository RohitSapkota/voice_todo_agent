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

	apiKey, isavail := os.LookupEnv("GEMINI_API_KEY")
	if !isavail {
		log.Fatal("API key not found")
	} else {
		fmt.Printf("API Key Set \n")
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}

	stream := client.Models.GenerateContentStream(
		ctx,
		"gemini-3-flash-preview",
		genai.Text(input),
		nil,
	)

	for chunk := range stream {
		part := chunk.Candidates[0].Content.Parts[0]
		fmt.Print(part.Text)
	}
}
