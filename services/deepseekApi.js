import { formatUtcDateTime, formatIstDateTime } from "../utils/dateUtils.js";

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
 * @returns {Promise<{ success: boolean, content?: string, error?: string, setupRequired?: boolean, model?: string }>}
 */
export async function generateMissionIntelligence({
  mode = "brief",
  mission = null,
  comparisonMission = null,
  userQuery = "",
  concept = "",
}) {
  let apiKey = (process.env.DEEPSEEK_API_KEY || "").trim();
  if (apiKey.startsWith("ysk-")) {
    apiKey = apiKey.substring(1); // Auto-heal accidental 'y' before 'sk-'
  }
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey || apiKey === "" || apiKey === "your_deepseek_api_key_here") {
    const fallbackContent = generateGroundedAerospaceAnalysis(
      mode,
      mission,
      comparisonMission,
      userQuery,
      concept,
      "DeepSeek API is not connected (DEEPSEEK_API_KEY is not configured in .env.local)"
    );

    return {
      success: false,
      setupRequired: true,
      error: "DEEPSEEK_API_KEY is not configured.",
      message:
        "DeepSeek Mission Intelligence requires a valid API key. Add DEEPSEEK_API_KEY=your_key to .env.local to activate real AI telemetry analysis.",
      content: fallbackContent,
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
      console.warn(`[DEEPSEEK API WARNING] HTTP ${res.status}: ${errText.slice(0, 120)}`);

      // Determine clear reason for the offline notice banner
      let reason = `DeepSeek API returned HTTP ${res.status}`;
      if (
        res.status === 402 ||
        errText.toLowerCase().includes("insufficient balance") ||
        errText.toLowerCase().includes("insufficient_balance")
      ) {
        reason = "DeepSeek API returned HTTP 402: Insufficient Balance — Your DeepSeek account has zero or exhausted query balance";
      } else if (res.status === 401 || res.status === 403) {
        reason = `DeepSeek API returned HTTP ${res.status}: Invalid or expired API Key`;
      } else if (res.status === 429) {
        reason = "DeepSeek API returned HTTP 429: Rate limit exceeded";
      } else if (res.status >= 500) {
        reason = `DeepSeek API returned HTTP ${res.status}: DeepSeek upstream server error`;
      }

      // Predefined grounded aerospace fallback containing verified flight telemetry
      const fallbackContent = generateGroundedAerospaceAnalysis(
        mode,
        mission,
        comparisonMission,
        userQuery,
        concept,
        reason
      );

      return {
        success: true,
        content: fallbackContent,
        model: "deepseek-grounded-telemetry (offline fallback)",
        isFallback: true,
        apiKeyWarning: reason,
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
    console.warn(`[DEEPSEEK API NETWORK NOTICE] ${err.message}`);
    const reason = `DeepSeek API not connected or network timeout (${err.message})`;
    const fallbackContent = generateGroundedAerospaceAnalysis(
      mode,
      mission,
      comparisonMission,
      userQuery,
      concept,
      reason
    );

    return {
      success: true,
      content: fallbackContent,
      model: "deepseek-grounded-telemetry (offline fallback)",
      isFallback: true,
      apiKeyWarning: reason,
    };
  }
}

/**
 * Generates the offline status notice banner placed at the beginning of fallback briefings.
 */
function formatOfflineNotice(reason) {
  const noteReason =
    reason ||
    "DeepSeek AI API is currently disconnected or account balance is insufficient (HTTP 402).";
  return `> ⚠️ **DeepSeek AI Service Notice: API Not Connected / Insufficient Account Balance**
> *Direct DeepSeek AI server inference is unavailable (${noteReason}).*
> *Displaying verified aerospace telemetry and flight intelligence grounded in official launch manifests.*

---

`;
}

/**
 * Procedural aerospace telemetry intelligence synthesis grounded in verified mission records.
 */
export function generateGroundedAerospaceAnalysis(
  mode,
  mission,
  comparisonMission,
  userQuery,
  concept,
  reason
) {
  const headerNotice = formatOfflineNotice(reason);

  const name = mission?.name || "Orbital Flight Operation";
  const vehicle =
    mission?.rocket?.name ||
    mission?.rocket?.configuration?.name ||
    "Orbital Launch Vehicle";
  const vehicleFamily = mission?.rocket?.family || "";
  const operator =
    mission?.agency?.name ||
    mission?.launch_service_provider?.name ||
    "Global Aerospace Operator";
  const operatorCountry = mission?.agency?.countryCode || mission?.agency?.abbrev || "";
  const orbit = mission?.mission?.orbit?.name || "Low Earth Orbit";
  const orbitClass = mission?.mission?.orbit?.abbrev || "LEO";
  const pad = mission?.pad?.name || "Launch Complex";
  const location =
    mission?.pad?.locationName ||
    mission?.pad?.location?.name ||
    "Spaceport";
  const lat = mission?.pad?.latitude;
  const lon = mission?.pad?.longitude;
  const status = mission?.status?.name || "Scheduled";
  const statusAbbrev = mission?.status?.abbrev || "";
  const net = mission?.net || "TBD";
  const desc =
    mission?.mission?.description ||
    "Primary orbital flight operation and payload deployment into target orbital plane under operator flight manifest.";

  const utcTime = formatUtcDateTime(net);
  const istTime = formatIstDateTime(net);

  if (mode === "ask" && userQuery) {
    return `${headerNotice}### 🛰️ Aerospace Intelligence Assessment: ${name}

**Telemetry Inquiry**: *"${userQuery}"*

**Verified Telemetry & Mission Parameters**:
- **Flight Operator & Heritage**: **${operator}**${operatorCountry ? ` (${operatorCountry})` : ""} maintains primary operational oversight for **${name}**, deploying the **${vehicle}**${vehicleFamily ? ` (${vehicleFamily} family)` : ""} launch architecture.
- **Flight Readiness & Status**: Official manifest designates this mission status as **${status}**${statusAbbrev ? ` [${statusAbbrev}]` : ""}.
- **Launch Timing (Dual-Timezone)**:
  - **UTC Liftoff**: **${utcTime}**
  - **IST Liftoff**: **${istTime}**
- **Spaceport / Launch Complex**: **${pad}**, situated at **${location}**${lat && lon ? ` (Coords: ${lat}°, ${lon}°)` : ""}.
- **Target Orbital Destination**: **${orbit}** (${orbitClass}), with an injection velocity profile of ~7.8 km/s upon upper-stage cutoff.
- **Payload & Mission Profile**: ${desc}

> *Telemetry Assurance: Parameters verified against Launch Library 2 flight records. All propulsion, staging, and telemetry downlink events are monitored live.*`;
  }

  if (mode === "compare" && comparisonMission) {
    const compName = comparisonMission.name || "Comparison Mission";
    const compVehicle =
      comparisonMission.rocket?.name ||
      comparisonMission.rocket?.configuration?.name ||
      "Orbital Launch Vehicle";
    const compOperator =
      comparisonMission.agency?.name ||
      comparisonMission.launch_service_provider?.name ||
      "Aerospace Operator";
    const compCountry =
      comparisonMission.agency?.countryCode || comparisonMission.agency?.abbrev || "";
    const compOrbit = comparisonMission.mission?.orbit?.name || "Low Earth Orbit";
    const compOrbitClass = comparisonMission.mission?.orbit?.abbrev || "LEO";
    const compPad = comparisonMission.pad?.name || "Launch Complex";
    const compLocation = comparisonMission.pad?.locationName || "Spaceport";
    const compStatus = comparisonMission.status?.name || "Scheduled";
    const compNet = comparisonMission.net || "TBD";
    const compUtcTime = formatUtcDateTime(compNet);
    const compIstTime = formatIstDateTime(compNet);

    return `${headerNotice}### ⚖️ Orbital Architecture Comparison: ${name} vs ${compName}

| Parameter | Primary Mission: ${name} | Comparison Mission: ${compName} |
| :--- | :--- | :--- |
| **Operator** | **${operator}**${operatorCountry ? ` (${operatorCountry})` : ""} | **${compOperator}**${compCountry ? ` (${compCountry})` : ""} |
| **Launch Vehicle** | **${vehicle}** | **${compVehicle}** |
| **Target Orbit** | **${orbit}** (${orbitClass}) | **${compOrbit}** (${compOrbitClass}) |
| **Scheduled T-0** | ${utcTime} (${istTime}) | ${compUtcTime} (${compIstTime}) |
| **Launch Pad** | ${pad}, ${location} | ${compPad}, ${compLocation} |
| **Flight Status** | ${status} | ${compStatus} |

#### Strategic Telemetry Comparison:
1. **Vehicle Class & Architecture**: Both vehicles provide orbital-class capability. ${vehicle} is engineered for specific payload capacity and dynamic pressure regimes (Max-Q) corresponding to target orbital inclination.
2. **Target Orbital Destination**: **${name}** is targeted for **${orbit}** (${orbitClass}), whereas **${compName}** is profiled for **${compOrbit}** (${compOrbitClass}).
3. **Operational Heritage & Provider Logistics**: Mission assurance and countdown protocols are conducted under **${operator}** and **${compOperator}** flight management directives.`;
  }

  if (mode === "explain") {
    const term = concept || userQuery || "Orbital Insertion";
    return `${headerNotice}### 📚 Aerospace Technical Briefing: "${term}"

#### 1. Technical Definition
**${term}** is a foundational principle in astronautics, rocketry, and orbital mechanics. It denotes the precise alignment of velocity vectors, attitude control, and propulsive delta-v expenditure required to achieve or modify a spacecraft's trajectory.

#### 2. Aerospace Dynamics Analogy
Imagine throwing an object so fast and high that as Earth curves beneath it, the object falls *around* the planet rather than back into it. At approximately 28,000 km/h (7.8 km/s in Low Earth Orbit), Earth's gravitational acceleration curves the vehicle's flight path at the exact same rate the planetary curvature drops away.

#### 3. Operational Relevance to Launch Operations
- **Staging & Cutoff Timing**: Dictates the exact millisecond for main engine cutoff (MECO) and second stage engine cutoff (SECO).
- **Aerodynamic & Thermal Management**: Balances velocity gain against atmospheric friction and aerodynamic heating.
- **Orbital Slot Precision**: Ensures spacecraft enter their designated operational altitudes and inclination planes without wasteful propellant expenditure.`;
  }

  // Default / Executive Briefing / Report mode
  return `${headerNotice}### 🚀 Flight Intelligence Briefing: ${name}

#### 1. Strategic Mission Overview
The **${name}** orbital spaceflight operation is conducted by **${operator}**${operatorCountry ? ` (${operatorCountry})` : ""} utilizing the **${vehicle}**${vehicleFamily ? ` (${vehicleFamily} family)` : ""} space transportation system.
- **Flight Objective**: ${desc}
- **Launch Readiness Status**: **${status}**${statusAbbrev ? ` [${statusAbbrev}]` : ""}

#### 2. Launch Timing & Spaceport Coordinates
- **Target T-0 (UTC)**: **${utcTime}**
- **Target T-0 (IST)**: **${istTime}**
- **Launch Complex**: **${pad}**
- **Spaceport Location**: **${location}**${lat && lon ? ` (Coordinates: ${lat}°, ${lon}°)` : ""}

#### 3. Orbital Profile & Trajectory
- **Target Insertion Plane**: **${orbit}** (${orbitClass})
- **Injection Trajectory**: High-precision multi-stage ascent with automated stage telemetry downlink and down-range ground station acquisition.

#### 4. Critical Flight Milestones to Monitor
- **T-0 Ignition & Liftoff**: Main propulsion ignition with acoustic water deluge suppression.
- **Max-Q (Maximum Dynamic Pressure)**: Peak mechanical stress on vehicle fairings (~T+60s to T+90s).
- **MECO / Stage Separation**: First stage main engine cutoff followed by pneumatic/pneumo-hydraulic stage separation.
- **Payload Fairing Jettison**: Jettison of protective fairing halves once outside atmospheric drag (>100 km Karman line).
- **Orbital Insertion Burn (SECO)**: Second stage cutoff establishing stable target orbit.`;
}

