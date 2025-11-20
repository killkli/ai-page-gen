
import { generateLearningObjectives, generateContentBreakdown } from './basicGenerators';
import { providerService } from '../providerService';

const testHierarchicalBreakdown = async () => {
    const topic = "Present Perfect Tense";
    // Use a dummy key that triggers the provider system (which handles the key internally or via env)
    const apiKey = "provider-system-call";

    console.log("Testing Hierarchical Breakdown for Topic:", topic);

    try {
        // 1. Generate Objectives
        console.log("\n--- Generating Objectives ---");
        const objectives = await generateLearningObjectives(topic, apiKey);
        console.log(`Generated ${objectives.length} objectives.`);
        console.log(JSON.stringify(objectives, null, 2));

        // 2. Generate Breakdown
        console.log("\n--- Generating Hierarchical Content Breakdown ---");
        const breakdown = await generateContentBreakdown(topic, apiKey, objectives);
        console.log(`Generated ${breakdown.length} breakdown items.`);
        console.log(JSON.stringify(breakdown, null, 2));

        // Basic Validation
        if (breakdown.length >= objectives.length * 2) {
            console.log("\n✅ SUCCESS: Generated at least 2 items per objective (approx).");
        } else {
            console.log("\n⚠️ WARNING: Breakdown item count is low. Check if hierarchy is working.");
        }

    } catch (error) {
        console.error("Error during test:", error);
    }
};

testHierarchicalBreakdown();
