
import { generateLearningObjectives, generateContentBreakdown } from './basicGenerators';

const testDifferentiation = async () => {
    const topic = "Present Perfect Tense";
    const apiKey = "provider-system-call"; // Mock key, relies on provider system

    console.log("Testing Differentiation for Topic:", topic);

    try {
        // 1. Generate Objectives
        console.log("\n--- Generating Objectives (Should be Outcomes) ---");
        const objectives = await generateLearningObjectives(topic, apiKey);
        console.log(JSON.stringify(objectives, null, 2));

        // 2. Generate Breakdown
        console.log("\n--- Generating Content Breakdown (Should be Structure) ---");
        const breakdown = await generateContentBreakdown(topic, apiKey, objectives);
        console.log(JSON.stringify(breakdown, null, 2));

    } catch (error) {
        console.error("Error during test:", error);
    }
};

testDifferentiation();
