using Microsoft.Extensions.Configuration;
using PrimeITServer.Application.Services;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;
using System.Text.Json.Serialization;

namespace PrimeITServer.Infrastructure.Services;

public sealed class GroqAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private const string ApiUrl = "https://api.groq.com/openai/v1/chat/completions";

    public GroqAiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Groq:ApiKey"] ?? throw new ArgumentNullException("Groq:ApiKey is missing");
    }

    public async Task<(int Score, string Evaluation)> EvaluateApplicationAsync(
        string jobDescription,
        string candidateAnswersJson,
        string candidateProfile,
        CancellationToken cancellationToken)
    {
        var prompt = $@"
Sistem Rolü: Sen profesyonel bir İK Analiz Sistemisin (PrimeIT Değerlendirme Protokolü).
Görevin: Bir adayın iş ilanındaki sorulara verdiği cevapları analiz etmek ve 0-100 arası bir puan üretmektir.

KRİTİK TALİMATLAR:
1. PUANLAMA SADECE ADAYIN SORULARA VERDİĞİ CEVAPLARA GÖRE YAPILMALIDIR. 
2. Adayın profil özeti (tecrübe, eğitim vb.) sadece bağlam için verilmiştir, ana puan kaynağı değildir.
3. EĞER ADAY SORULARI CEVAPLAMAMIŞSA VEYA CEVAPLAR İLGİSİZSE PUAN 0 OLMALIDIR.
4. Cevaplar sorularla tam örtüşüyorsa ve teknik yeterliliği kanıtlıyorsa yüksek puan ver.

GİRDİLER:
İş Tanımı: {jobDescription}
Adayın Profil Özeti: {candidateProfile}
Adayın Özel Sorulara Cevapları (JSON): {candidateAnswersJson}

ÇIKTI FORMATI (SADECE JSON):
{{
  ""score"": 85,
  ""evaluation"": ""Adayın teknik sorulara verdiği cevaplar ilandaki beklentilerle %85 oranında örtüşmektedir...""
}}";

        var requestBody = new
        {
            model = "llama-3.3-70b-versatile",
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            temperature = 0.3,
            response_format = new { type = "json_object" }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, ApiUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var resultJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(resultJson);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

        var evaluationResult = JsonSerializer.Deserialize<AiEvaluationResponse>(content!)!;

        return (evaluationResult.Score, evaluationResult.Evaluation);
    }

    private class AiEvaluationResponse
    {
        [JsonPropertyName("score")]
        public int Score { get; set; }

        [JsonPropertyName("evaluation")]
        public string Evaluation { get; set; } = string.Empty;
    }
}
