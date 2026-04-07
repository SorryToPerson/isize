export type PlatformKey =
  | "web"
  | "ios"
  | "macos"
  | "android"
  | "windows"
  | "miniprogram";

export type ProcessingExecutor = "client" | "server";
export type IconShape = "square" | "circle" | "squircle" | "rounded-rect";

export interface IconVariant {
  id: string;
  width: number;
  height: number;
  fileName: string;
  purpose: "favicon" | "launcher" | "store" | "touch" | "tile";
  recommendedExecutor: ProcessingExecutor;
  notes?: string;
  shape?: IconShape;
  backgroundColor?: string;
}

export interface PlatformPreset {
  key: PlatformKey;
  label: string;
  description: string;
  designNotes: string[];
  variants: IconVariant[];
}

export const PRODUCT_PRINCIPLES = [
  "local-first",
  "client-first-processing",
  "server-no-persistence",
  "platform-spec-correctness"
] as const;

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    key: "web",
    label: "WEB / PWA",
    description: "浏览器站点图标、Apple Touch Icon 与 PWA 安装图标。",
    designNotes: [
      "优先提供透明背景 PNG。",
      "favicon 与 PWA 建议使用同一主视觉。"
    ],
    variants: [
      {
        id: "favicon-16",
        width: 16,
        height: 16,
        fileName: "favicon-16x16.png",
        purpose: "favicon",
        recommendedExecutor: "client"
      },
      {
        id: "favicon-32",
        width: 32,
        height: 32,
        fileName: "favicon-32x32.png",
        purpose: "favicon",
        recommendedExecutor: "client"
      },
      {
        id: "apple-touch-180",
        width: 180,
        height: 180,
        fileName: "apple-touch-icon.png",
        purpose: "touch",
        recommendedExecutor: "client",
        shape: "squircle",
        backgroundColor: "#FFFFFF"
      },
      {
        id: "pwa-192",
        width: 192,
        height: 192,
        fileName: "icon-192.png",
        purpose: "launcher",
        recommendedExecutor: "client"
      },
      {
        id: "pwa-512",
        width: 512,
        height: 512,
        fileName: "icon-512.png",
        purpose: "store",
        recommendedExecutor: "client"
      }
    ]
  },
  {
    key: "ios",
    label: "iOS",
    description: "iPhone / iPad 应用图标输出。",
    designNotes: [
      "不要在源图中预加圆角，系统会自动处理。",
      "确保主图在安全区内可辨识。"
    ],
    variants: [
      {
        id: "ios-60-2x",
        width: 120,
        height: 120,
        fileName: "AppIcon-60@2x.png",
        purpose: "launcher",
        recommendedExecutor: "client",
        shape: "squircle",
        backgroundColor: "#FFFFFF"
      },
      {
        id: "ios-60-3x",
        width: 180,
        height: 180,
        fileName: "AppIcon-60@3x.png",
        purpose: "launcher",
        recommendedExecutor: "client",
        shape: "squircle",
        backgroundColor: "#FFFFFF"
      },
      {
        id: "ios-83-5-2x",
        width: 167,
        height: 167,
        fileName: "AppIcon-83.5@2x.png",
        purpose: "launcher",
        recommendedExecutor: "client",
        shape: "squircle",
        backgroundColor: "#FFFFFF"
      },
      {
        id: "ios-store",
        width: 1024,
        height: 1024,
        fileName: "AppStore-1024.png",
        purpose: "store",
        recommendedExecutor: "client",
        shape: "squircle",
        backgroundColor: "#FFFFFF"
      }
    ]
  },
  {
    key: "android",
    label: "Android",
    description: "安卓前台图标和商店图标的基础规格。",
    designNotes: [
      "前景图建议保留留白，适配不同品牌蒙版。",
      "商店图建议使用完整 512 规格。"
    ],
    variants: [
      {
        id: "android-mdpi",
        width: 48,
        height: 48,
        fileName: "ic_launcher_48x48.png",
        purpose: "launcher",
        recommendedExecutor: "client"
      },
      {
        id: "android-hdpi",
        width: 72,
        height: 72,
        fileName: "ic_launcher_72x72.png",
        purpose: "launcher",
        recommendedExecutor: "client"
      },
      {
        id: "android-xhdpi",
        width: 96,
        height: 96,
        fileName: "ic_launcher_96x96.png",
        purpose: "launcher",
        recommendedExecutor: "client"
      },
      {
        id: "android-xxxhdpi",
        width: 192,
        height: 192,
        fileName: "ic_launcher_192x192.png",
        purpose: "launcher",
        recommendedExecutor: "client"
      },
      {
        id: "android-store",
        width: 512,
        height: 512,
        fileName: "play_store_512x512.png",
        purpose: "store",
        recommendedExecutor: "client"
      }
    ]
  },
  {
    key: "macos",
    label: "macOS",
    description: "macOS 应用图标多尺寸资源。",
    designNotes: [
      "注意桌面端图标在小尺寸下的可辨识度。",
      "建议为复杂 Logo 保留适当边距。"
    ],
    variants: [
      {
        id: "macos-16",
        width: 16,
        height: 16,
        fileName: "icon_16x16.png",
        purpose: "launcher",
        recommendedExecutor: "client",
        shape: "squircle"
      },
      {
        id: "macos-32",
        width: 32,
        height: 32,
        fileName: "icon_16x16@2x.png",
        purpose: "launcher",
        recommendedExecutor: "client",
        shape: "squircle"
      },
      {
        id: "macos-256",
        width: 256,
        height: 256,
        fileName: "icon_128x128@2x.png",
        purpose: "launcher",
        recommendedExecutor: "client",
        shape: "squircle"
      },
      {
        id: "macos-512",
        width: 512,
        height: 512,
        fileName: "icon_512x512.png",
        purpose: "launcher",
        recommendedExecutor: "client",
        shape: "squircle"
      },
      {
        id: "macos-1024",
        width: 1024,
        height: 1024,
        fileName: "icon_512x512@2x.png",
        purpose: "store",
        recommendedExecutor: "client",
        shape: "squircle"
      }
    ]
  },
  {
    key: "windows",
    label: "Windows",
    description: "Windows 应用与磁贴图标基础规格。",
    designNotes: [
      "需要兼顾磁贴与应用入口两类场景。",
      "多规格打包在服务端统一兜底更稳定。"
    ],
    variants: [
      {
        id: "windows-44",
        width: 44,
        height: 44,
        fileName: "Square44x44Logo.png",
        purpose: "tile",
        recommendedExecutor: "server"
      },
      {
        id: "windows-50",
        width: 50,
        height: 50,
        fileName: "StoreLogo.png",
        purpose: "store",
        recommendedExecutor: "server"
      },
      {
        id: "windows-150",
        width: 150,
        height: 150,
        fileName: "Square150x150Logo.png",
        purpose: "tile",
        recommendedExecutor: "server"
      },
      {
        id: "windows-310",
        width: 310,
        height: 310,
        fileName: "Square310x310Logo.png",
        purpose: "tile",
        recommendedExecutor: "server"
      }
    ]
  },
  {
    key: "miniprogram",
    label: "小程序",
    description: "预留小程序与轻应用场景的图标规格。",
    designNotes: [
      "不同平台规范差异较大，需按目标平台继续细化。",
      "MVP 先保留能力位，不阻塞主流程。"
    ],
    variants: [
      {
        id: "mini-32",
        width: 32,
        height: 32,
        fileName: "mini-icon-32.png",
        purpose: "launcher",
        recommendedExecutor: "client"
      },
      {
        id: "mini-64",
        width: 64,
        height: 64,
        fileName: "mini-icon-64.png",
        purpose: "launcher",
        recommendedExecutor: "client"
      },
      {
        id: "mini-128",
        width: 128,
        height: 128,
        fileName: "mini-icon-128.png",
        purpose: "store",
        recommendedExecutor: "client"
      }
    ]
  }
];
