import type { Recipe } from "@/types/task-creation";

// Helper function to generate more mock recipes
function generateAdditionalRecipes(): Recipe[] {
  const additionalRecipes: Recipe[] = [];
  
  // Generate more traffic statistics recipes
  for (let i = 7; i <= 25; i++) {
    additionalRecipes.push({
      id: `recipe-${i}`,
      name: `交通監測方案 ${i}`,
      description: `用於特定場景的交通流量統計方案 ${i}`,
      taskType: "trafficStatistics",
      status: i % 3 === 0 ? "inactive" : "active",
      regions: [
        {
          id: `region-${i * 2 - 1}`,
          name: `監測區域 A-${i}`,
          points: [
            { x: 100 + (i * 10) % 200, y: 200 + (i * 5) % 100 },
            { x: 500 + (i * 10) % 200, y: 200 + (i * 5) % 100 },
          ],
        },
        {
          id: `region-${i * 2}`,
          name: `監測區域 B-${i}`,
          points: [
            { x: 100 + (i * 10) % 200, y: 350 + (i * 5) % 100 },
            { x: 500 + (i * 10) % 200, y: 350 + (i * 5) % 100 },
          ],
        },
      ],
      modelId: i % 2 === 0 ? "yolov8-traffic" : "yolov8-highway",
      confidenceThreshold: 0.7 + (i % 3) * 0.05,
      createdAt: new Date(2024, 0, i).toISOString(),
    });
  }
  
  // Generate more train detection recipes
  for (let i = 26; i <= 40; i++) {
    additionalRecipes.push({
      id: `recipe-${i}`,
      name: `列車偵測方案 ${i - 25}`,
      description: `鐵路系統列車監測方案 ${i - 25}`,
      taskType: "trainDetection",
      status: i % 4 === 0 ? "inactive" : "active",
      regions: [
        {
          id: `region-${i * 2}`,
          name: `軌道區域 ${i - 25}`,
          points: [
            { x: 150 + (i * 15) % 100, y: 200 },
            { x: 650 - (i * 15) % 100, y: 200 },
            { x: 650 - (i * 15) % 100, y: 450 },
            { x: 150 + (i * 15) % 100, y: 450 },
          ],
        },
      ],
      modelId: i % 3 === 0 ? "yolov8-hsr" : "yolov8-train",
      confidenceThreshold: 0.85 + (i % 4) * 0.03,
      createdAt: new Date(2024, 1, i - 25).toISOString(),
    });
  }
  
  return additionalRecipes;
}

export const mockRecipes: Recipe[] = [
  // Traffic Statistics Recipes
  {
    id: "recipe-1",
    name: "市區主幹道交通流量監測",
    description: "用於監測市區主要道路的車流量統計",
    taskType: "trafficStatistics",
    status: "active",
    regions: [
      {
        id: "region-1",
        name: "北向計數線",
        points: [
          { x: 100, y: 300 },
          { x: 700, y: 300 },
        ],
      },
      {
        id: "region-2",
        name: "南向計數線",
        points: [
          { x: 100, y: 400 },
          { x: 700, y: 400 },
        ],
      },
    ],
    modelId: "yolov8-traffic",
    confidenceThreshold: 0.7,
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "recipe-2",
    name: "十字路口車流分析",
    description: "複雜十字路口的多向車流統計分析",
    taskType: "trafficStatistics",
    status: "active",
    regions: [
      {
        id: "region-3",
        name: "東西向計數區",
        points: [
          { x: 200, y: 200 },
          { x: 600, y: 200 },
          { x: 600, y: 300 },
          { x: 200, y: 300 },
        ],
      },
      {
        id: "region-4",
        name: "南北向計數區",
        points: [
          { x: 350, y: 100 },
          { x: 450, y: 100 },
          { x: 450, y: 500 },
          { x: 350, y: 500 },
        ],
      },
    ],
    modelId: "yolov8-traffic",
    confidenceThreshold: 0.75,
    createdAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "recipe-3",
    name: "高速公路車流監測",
    description: "高速公路多車道車流量即時統計",
    taskType: "trafficStatistics",
    status: "active",
    regions: [
      {
        id: "region-5",
        name: "車道1",
        points: [
          { x: 50, y: 350 },
          { x: 250, y: 350 },
        ],
      },
      {
        id: "region-6",
        name: "車道2",
        points: [
          { x: 260, y: 350 },
          { x: 460, y: 350 },
        ],
      },
      {
        id: "region-7",
        name: "車道3",
        points: [
          { x: 470, y: 350 },
          { x: 670, y: 350 },
        ],
      },
    ],
    modelId: "yolov8-highway",
    confidenceThreshold: 0.8,
    createdAt: "2024-02-01T14:00:00Z",
  },

  // Train Detection Recipes
  {
    id: "recipe-4",
    name: "台北車站月台監測",
    description: "監測列車進出站狀態及停靠時間",
    taskType: "trainDetection",
    status: "active",
    regions: [
      {
        id: "region-8",
        name: "月台區域",
        points: [
          { x: 100, y: 200 },
          { x: 700, y: 200 },
          { x: 700, y: 500 },
          { x: 100, y: 500 },
        ],
      },
    ],
    modelId: "yolov8-train",
    confidenceThreshold: 0.85,
    createdAt: "2024-01-25T09:00:00Z",
  },
  {
    id: "recipe-5",
    name: "鐵路平交道安全監測",
    description: "偵測平交道區域的列車通過情況",
    taskType: "trainDetection",
    status: "active",
    regions: [
      {
        id: "region-9",
        name: "平交道偵測區",
        points: [
          { x: 150, y: 250 },
          { x: 650, y: 250 },
          { x: 650, y: 450 },
          { x: 150, y: 450 },
        ],
      },
    ],
    modelId: "yolov8-train",
    confidenceThreshold: 0.9,
    createdAt: "2024-02-05T11:30:00Z",
  },
  {
    id: "recipe-6",
    name: "高鐵隧道監測系統",
    description: "監測高速鐵路隧道進出口的列車狀態",
    taskType: "trainDetection",
    status: "inactive",
    regions: [
      {
        id: "region-10",
        name: "隧道入口",
        points: [
          { x: 200, y: 150 },
          { x: 600, y: 150 },
          { x: 600, y: 550 },
          { x: 200, y: 550 },
        ],
      },
    ],
    modelId: "yolov8-hsr",
    confidenceThreshold: 0.88,
    createdAt: "2024-01-18T13:45:00Z",
  },
  
  // Add generated recipes to simulate many recipes
  ...generateAdditionalRecipes(),
];
