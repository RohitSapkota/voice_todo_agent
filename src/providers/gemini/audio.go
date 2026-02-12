package gemini

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strings"

	"google.golang.org/genai"
)

const (
	defaultAudioMIMEType = "audio/webm"
	transcriptionModel   = "gemini-3-flash-preview"
	transcriptionPrompt  = "Transcribe this audio. Return only the spoken text with no extra commentary."
)

func Transcribe(base64Audio string) (string, error) {
	return TranscribeBase64WithMIME(base64Audio, defaultAudioMIMEType)
}

func TranscribeBase64WithMIME(base64Audio string, mimeType string) (string, error) {
	audioBytes, err := decodeBase64Audio(base64Audio)
	if err != nil {
		return "", fmt.Errorf("decode audio base64: %w", err)
	}

	if strings.TrimSpace(mimeType) == "" {
		mimeType = defaultAudioMIMEType
	}

	return transcribeBytes(audioBytes, mimeType)
}

func transcribeBytes(audioBytes []byte, mimeType string) (string, error) {
	if len(audioBytes) == 0 {
		return "", errors.New("audio payload is empty")
	}

	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if apiKey == "" {
		return "", errors.New("GEMINI_API_KEY is not set")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return "", fmt.Errorf("create Gemini client: %w", err)
	}

	parts := []*genai.Part{
		genai.NewPartFromText(transcriptionPrompt),
		genai.NewPartFromBytes(audioBytes, mimeType),
	}

	contents := []*genai.Content{
		genai.NewContentFromParts(parts, genai.RoleUser),
	}

	result, err := client.Models.GenerateContent(ctx, transcriptionModel, contents, nil)
	if err != nil {
		return "", fmt.Errorf("transcribe audio: %w", err)
	}

	return strings.TrimSpace(result.Text()), nil
}

func decodeBase64Audio(input string) ([]byte, error) {
	base64Payload := strings.TrimSpace(input)
	if base64Payload == "" {
		return nil, errors.New("base64 audio is empty")
	}

	if comma := strings.Index(base64Payload, ","); comma != -1 && strings.Contains(base64Payload[:comma], ";base64") {
		base64Payload = base64Payload[comma+1:]
	}

	audioBytes, err := base64.StdEncoding.DecodeString(base64Payload)
	if err == nil {
		return audioBytes, nil
	}

	audioBytes, rawErr := base64.RawStdEncoding.DecodeString(base64Payload)
	if rawErr == nil {
		return audioBytes, nil
	}

	return nil, err
}
