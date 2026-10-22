/**
 * Server-side DeepSeek Mission Intelligence Service.
 * Provides grounded aerospace intelligence strictly based on verified telemetry records.
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * Generates AI intelligence using DeepSeek API with strict grounding in provided mission data.
 *
 * @param {object} params
 * @param {string} params.mode - 'brief' | 'ask' | 'compare' | 'explain' | 'report'
 * @param {object} [params.mission] - Primary mission object
 * @param {object} [params.comparisonMission] - Secondary mission object for comparison mode
 * @param {string} [params.userQuery] - Custom question asked by user
 * @param {string} [params.concept] - Aerospace term to explain
 * @returns {Promise<{ success: boolean, content?: string, error?: string, setupRequired?: boolean }>}
 */
export async function generateMissionIntelligence({
  mode = "brief",
  mission = null,
  comparisonMission = null,
  userQuery = "",
  concept = "",
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_deepseek_api_key_here") {
    return {
      success: false,
      setupRequired: true,
      error: "DEEPSEEK_API_KEY is not configured.",
      message:
        "DeepSeek Mission Intelligence requires a valid API key. Add DEEPSEEK_API_KEY=your_key to .env.local to activate real AI telemetry analysis.",
    };
  }

  // Build system prompt enforcing aerospace veracity
  const systemPrompt = `You are the Flight Telemetry & Intelligence Specialist for the RocketLaunch Aerospace Platform.
Your duty is to provide accurate, objective, and professionally structured aerospace briefings.
CRITICAL RULES:
1. Ground all analysis strictly in the verified mission facts provided in the prompt.
2. NEVER invent launch dates, rocket specifications, agency contracts, or mission outcomes.
3. If specific parameters (like payload mass, exact launch window, or orbit inclination) are unknown or missing, explicitly state: "Parameter unconfirmed by official manifest."
4. Do not assume a scheduled flight succeeded merely because its scheduled timestamp has arrived.
5. Format responses using clean GitHub-style Markdown with clear sections, bullet points, and bold metric labels.`;

  let userPrompt = "";

  switch (mode) {
    case "brief":
      userPrompt = `Generate a high-level executive mission briefing for the following upcoming orbital operation:
Mission Name: ${mission?.name || "Unspecified"}
Agency / Operator: ${mission?.agency?.name || "Commercial Aerospace Operator"} (${mission?.agency?.countryCode || "INTL"})
Launch Vehicle: ${mission?.rocket?.name || "Orbital Launch System"}
Scheduled T-0: ${mission?.net || "TBD"}
Spaceport & Pad: ${mission?.pad?.name || "Launch Pad"}, ${mission?.pad?.locationName || "Spaceport"}
Target Orbit: ${mission?.mission?.orbit?.name || "Low Earth Orbit"} (${mission?.mission?.orbit?.abbrev || "LEO"})
Mission Objective: ${mission?.mission?.description || "Payload deployment"}
Status: ${mission?.status?.name || "Scheduled"}

Please summarize:
1. Strategic Overview (2-3 sentences)
2. Launch Architecture & Vehicle Highlights
3. Orbital Trajectory & Operational Target
4. Key Mission Milestones to Monitor`;
      break;

    case "ask":
      userPrompt = `The user is inquiring about this mission:
Mission: ${mission?.name || "Orbital Operation"} (${mission?.agency?.name || "Space Operator"})
Rocket: ${mission?.rocket?.name || "Launch Vehicle"}
Scheduled Date: ${mission?.net || "TBD"}
Pad: ${mission?.pad?.name || "Spaceport"}
Mission Details: ${mission?.mission?.description || "Satellite deployment"}
Status: ${mission?.status?.name || "Active"}

User Question: "${userQuery}"

Provide a factual, technically rigorous answer based strictly on available aerospace knowledge and this flight's profile.`;
      break;

    case "compare":
      userPrompt = `Compare these two orbital spaceflight missions objectively:
MISSION A:
- Name: ${mission?.name}
- Agency: ${mission?.agency?.name}
- Vehicle: ${mission?.rocket?.name}
- Target Orbit: ${mission?.mission?.orbit?.name}
- Status: ${mission?.status?.name}
- Scheduled: ${mission?.net}

MISSION B:
- Name: ${comparisonMission?.name}
- Agency: ${comparisonMission?.agency?.name}
- Vehicle: ${comparisonMission?.rocket?.name}
- Target Orbit: ${comparisonMission?.mission?.orbit?.name}
- Status: ${comparisonMission?.status?.name}
- Scheduled: ${comparisonMission?.net}

Provide a structured comparison highlighting:
1. Launch Vehicle Class & Performance Profile
2. Orbital Destination & Mission Class
3. Operational Provider & Heritage`;
      break;

    case "explain":
      userPrompt = `Explain the following aerospace concept or terminology in beginner-friendly, vivid, but technically accurate English:
Concept: "${concept || userQuery || "Orbital Insertion"}"

Include:
1. Simple definition
2. Real-world analogy
3. Why it matters in rocket launches`;
      break;

    case "report":
    default:
      userPrompt = `Generate a full flight readiness report for:
Mission: ${mission?.name}
Rocket: ${mission?.rocket?.name}
Provider: ${mission?.agency?.name}
Pad: ${mission?.pad?.name}, ${mission?.pad?.locationName}
Scheduled Date: ${mission?.net}
Summary: ${mission?.mission?.description}

Include:
# Technical Overview
# Launch Pad Telemetry
# Orbit & Payload Insertion
# Operational Risk Factors & Uncertainties`;
      break;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `DeepSeek API returned HTTP ${res.status}: ${errText.slice(0, 100)}`,
      };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No intelligence returned.";

    return {
      success: true,
      content: reply,
      model: data.model || model,
    };
  } catch (err) {
    return {
      success: false,
      error: err.name === "AbortError" ? "DeepSeek API request timed out." : err.message,
    };
  }
}
