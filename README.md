# Como Estou - React Native

Aplicação móvel Como Estou, recriada em React Native com Expo. Permite registrar humor diário, ver tendências e histórico.

## Funcionalidades

- Login e registro com e-mail/senha
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
