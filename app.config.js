export default ({ config }) => ({
  expo: {
    name: getAppName(),
    slug: "are-you-sleep",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: getUniqueIdentifier(),
      supportsTablet: true,
    },
    android: {
      package: getUniqueIdentifier(),
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      edgeToEdgeEnabled: true,
      usesCleartextTraffic: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "51680b19-190d-455a-8a17-e3247bc34025"
      }
    },
    owner: "jungleer",
    updates: {
      url: "https://u.expo.dev/51680b19-190d-455a-8a17-e3247bc34025"
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  }
});

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.jungleer.areyousleep.dev';
  }

  if (IS_PREVIEW) {
    return 'com.jungleer.areyousleep.preview';
  }

  return 'com.jungleer.areyousleep';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'areyousleep (Dev)';
  }

  if (IS_PREVIEW) {
    return 'areyousleep (Preview)';
  }

  return 'areyousleep';
};
