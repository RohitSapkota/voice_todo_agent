package gemini

import (
	"context"
	"fmt"
	"os"
	"strings"
	"sync"

	"google.golang.org/genai"
)

var (
	historyMu sync.Mutex
	history   []*genai.Content
)

func TextToText(input string) (string, error) {
	ctx := context.Background()

	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY is not set")
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %w", err)
	}

	userInput := genai.NewContentFromText(input, genai.RoleUser)

	// Keep history consistent per request so each turn includes previous turns.
	historyMu.Lock()
	defer historyMu.Unlock()

	contents := append(append([]*genai.Content{}, history...), userInput)

	config := &genai.GenerateContentConfig{
		SystemInstruction: &genai.Content{
			Parts: []*genai.Part{{Text: "You are a helpful personal assistant who remember TODO items."}},
		},
	}
	
	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-3-flash-preview",
		contents,
		config,
	)
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
	}

	responseText := strings.TrimSpace(result.Text())
	if responseText != "" {
		history = append(history, userInput, genai.NewContentFromText(responseText, genai.RoleModel))
	}

	return responseText, nil
}
