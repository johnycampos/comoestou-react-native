# Como Estou - React Native

Aplicação móvel Como Estou, recriada em React Native com Expo. Permite registrar humor diário, ver tendências e histórico.

## Funcionalidades

- Login e registro com e-mail/senha e **Google**
- Captura de humor (1-5) com notas
- Gráfico de tendência semanal
- Histórico das últimas 30 entradas
- Integração com Firebase (Auth + Firestore)

## Desenvolvimento

```bash
# Instalar dependências (já feito)
npm install

# Iniciar em modo desenvolvimento
npm run android   # Emulador/dispositivo Android
npm run ios       # Simulador iOS (apenas macOS)
npm start         # Expo Dev Tools
```

## Gerar APK

Para gerar um APK instalável:

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login na Expo

```bash
eas login
```

### 3. Configurar o projeto (primeira vez)

```bash
eas build:configure
```

### 4. Gerar o APK

```bash
# APK para instalação direta (não publica na Play Store)
eas build -p android --profile preview

# Ou criar perfil "apk" no eas.json:
# "apk": { "android": { "buildType": "apk" } }
# eas build -p android --profile apk
```

O build roda na nuvem da Expo. Ao terminar, um link para download do APK será exibido.

### Build local (sem EAS)

Para builds locais, use o modo "development build":

```bash
npx expo prebuild
cd android && ./gradlew assembleRelease
```

O APK estará em `android/app/build/outputs/apk/release/`.

**Erro "com.facebook.react.settings" ou "Unsupported class file major version 69"?**  
O Gradle 8.x exige **Java 17** (não suporta Java 25). Se você tem Java 25 instalado:

1. Instale o JDK 17: `winget install Microsoft.OpenJDK.17`
2. Em `android/gradle.properties`, descomente e ajuste a linha:
   ```
   org.gradle.java.home=C:\\Program Files\\Microsoft\\jdk-17.x.x
   ```
   (use o caminho real do JDK 17 instalado)

## Login com Google

O app suporta login com Google. Para funcionar, faça:

### 1. Configurar Firebase

- No [Firebase Console](https://console.firebase.google.com/) > Authentication > Sign-in method > habilite **Google**
- Em Project Settings, baixe:
  - **Android:** `google-services.json` → coloque na raiz do projeto
  - **iOS:** `GoogleService-Info.plist` → coloque na raiz do projeto

### 2. Web Client ID

- No [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (projeto vinculado ao Firebase), copie o **Client ID** do tipo "Web application"
- Em `src/firebase/config.ts`, substitua o valor de `googleWebClientId` pelo seu Client ID

### 3. Build nativo

O Google Sign-In usa código nativo e **não funciona no Expo Go**. Use development build:

```bash
npx expo prebuild --clean
npx expo run:android
# ou
npx expo run:ios
```
