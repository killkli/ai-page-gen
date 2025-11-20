import React, { useMemo, useState, useEffect } from 'react';
import { StudentGrade, MaterialItem } from '../../../core/types';
import mathPr from '../../../data/boyo/math_pr.json';
import mathJh from '../../../data/boyo/math_jh.json';
import englishPr from '../../../data/boyo/english_pr.json';
import englishJh from '../../../data/boyo/english_jh.json';

interface MaterialSelectorProps {
    subject: 'math' | 'english';
    studentGrade: StudentGrade;
    selectedMaterials: MaterialItem[];
    onSelectionChange: (selected: MaterialItem[]) => void;
}

interface GroupedMaterials {
    [unit: string]: MaterialItem[];
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
    subject,
    studentGrade,
    selectedMaterials,
    onSelectionChange,
}) => {
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

    // Determine which dataset to use and filter by grade
    const materials = useMemo(() => {
        let allMaterials: MaterialItem[] = [];

        if (subject === 'math') {
            allMaterials = [...(mathPr as MaterialItem[]), ...(mathJh as MaterialItem[])];
        } else {
            allMaterials = [...(englishPr as MaterialItem[]), ...(englishJh as MaterialItem[])];
        }

        // Filter based on StudentGrade
        // Mapping StudentGrade to numeric grades
        const targetGrades: number[] = [];
        switch (studentGrade) {
            case 'preschool':
                // Maybe show Grade 1 for preschool? Or nothing?
                // Let's show Grade 1 as simplest available
                targetGrades.push(1);
                break;
            case 'elementary_low':
                targetGrades.push(1, 2);
                break;
            case 'elementary_mid':
                targetGrades.push(3, 4);
                break;
            case 'elementary_high':
                targetGrades.push(5, 6);
                break;
            case 'junior_7':
                targetGrades.push(7);
                break;
            case 'junior_8':
                targetGrades.push(8);
                break;
            case 'junior_9':
                targetGrades.push(9);
                break;
            case 'high_school_review':
                // Show all Junior High materials for review
                targetGrades.push(7, 8, 9);
                break;
            default:
                break;
        }

        return allMaterials.filter(item => targetGrades.includes(item.grade));
    }, [subject, studentGrade]);

    // Group materials by Unit
    const groupedMaterials = useMemo(() => {
        const groups: GroupedMaterials = {};
        materials.forEach(item => {
            if (!groups[item.unit]) {
                groups[item.unit] = [];
            }
            groups[item.unit].push(item);
        });
        return groups;
    }, [materials]);

    // Initialize expanded units (expand all by default if not too many, or just collapse)
    // Let's expand the first few to be helpful
    useEffect(() => {
        const units = Object.keys(groupedMaterials);
        if (units.length > 0 && expandedUnits.size === 0) {
            // Expand the first unit by default
            setExpandedUnits(new Set([units[0]]));
        }
    }, [groupedMaterials, expandedUnits]);

    const toggleUnit = (unit: string) => {
        const newExpanded = new Set(expandedUnits);
        if (newExpanded.has(unit)) {
            newExpanded.delete(unit);
        } else {
            newExpanded.add(unit);
        }
        setExpandedUnits(newExpanded);
    };

    const handleItemToggle = (item: MaterialItem) => {
        const isSelected = selectedMaterials.some(m => m.title === item.title);
        const newSelected = isSelected
            ? selectedMaterials.filter(m => m.title !== item.title)
            : [...selectedMaterials, item];
        onSelectionChange(newSelected);
    };

    const handleUnitToggleSelect = (_unit: string, items: MaterialItem[]) => {
        const allSelected = items.every(item => selectedMaterials.some(m => m.title === item.title));

        if (allSelected) {
            // Deselect all in unit
            const titlesToRemove = items.map(i => i.title);
            onSelectionChange(selectedMaterials.filter(m => !titlesToRemove.includes(m.title)));
        } else {
            // Select all in unit
            const itemsToAdd = items.filter(item => !selectedMaterials.some(m => m.title === item.title));
            onSelectionChange([...selectedMaterials, ...itemsToAdd]);
        }
    };

    if (materials.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                此年級無對應的博幼教材資料。
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(groupedMaterials).map(([unit, items]) => {
                const isExpanded = expandedUnits.has(unit);
                const selectedCount = items.filter(i => selectedMaterials.some(m => m.title === i.title)).length;
                const isAllSelected = selectedCount === items.length;
                const isPartiallySelected = selectedCount > 0 && !isAllSelected;

                return (
                    <div key={unit} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleUnit(unit)}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className="p-1 hover:bg-gray-200 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnitToggleSelect(unit, items);
                                    }}
                                >
                                    <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${isAllSelected ? 'bg-indigo-600 border-indigo-600' :
                                        isPartiallySelected ? 'bg-indigo-100 border-indigo-400' : 'bg-white border-gray-300'
                                        }`}>
                                        {isAllSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        {isPartiallySelected && <div className="w-3 h-0.5 bg-indigo-600 rounded-full" />}
                                    </div>
                                </div>
                                <span className="font-medium text-gray-800 select-none">{unit}</span>
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                    {selectedCount}/{items.length}
                                </span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {isExpanded && (
                            <div className="divide-y divide-gray-100 border-t border-gray-200">
                                {items.map((item) => {
                                    const isSelected = selectedMaterials.some(m => m.title === item.title);
                                    return (
                                        <div
                                            key={item.title}
                                            className={`px-4 py-3 flex items-start space-x-3 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleItemToggle(item)}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                                                }`}>
                                                {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                    {item.title}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {item.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MaterialSelector;
