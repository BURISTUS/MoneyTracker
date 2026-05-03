// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { View, TouchableOpacity, Pressable, Modal as RNModal, Platform, Alert, TextInput } from 'react-native';
// import { Text } from '../../../components/ui/text';
// import { aiService } from '../../services/ai';
// import type { AiTransactionResult } from '../../services/ai';
// // import { ExpoWebSpeechRecognition } from 'expo-speech-recognition';
// // import { useSpeechRecognitionEvent } from 'expo-speech-recognition';

// interface VoiceInputModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onResult: (result: AiTransactionResult) => void;
//   onError?: (error: string) => void;
// }

// export function VoiceInputModal({
//   visible,
//   onClose,
//   onResult,
//   onError,
// }: VoiceInputModalProps) {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const recognitionRef = useRef<ExpoWebSpeechRecognition | null>(null);

//   // Сброс при открытии
//   useEffect(() => {
//     if (visible) {
//       setTranscript('');
//       setIsListening(false);
//       setIsProcessing(false);
//     }
//     return () => {
//       cleanup();
//     };
//   }, [visible]);

//   // Подписка на события распознавания через хук
//   // useSpeechRecognitionEvent('result', (event) => {
//   //   // event.results — массив результатов, берём лучший
//   //   const results = event.results;
//   //   if (results && results.length > 0) {
//   //     const bestResult = results[0];
//   //     const text = bestResult.transcript || '';
//   //     setTranscript(text);
//   //   }
//   // });

//   // useSpeechRecognitionEvent('error', (event) => {
//   //   console.error('Speech recognition error:', event.error, event.message);
//   //   setIsListening(false);
//   //   if (event.error === 'not-allowed') {
//   //     Alert.alert('Нет доступа', 'Разрешите доступ к микрофону в настройках');
//   //   }
//   // });

//   // useSpeechRecognitionEvent('end', () => {
//   //   setIsListening(false);
//   // });

//   const cleanup = useCallback(() => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.abort();
//       } catch (e) {
//         // ignore
//       }
//       recognitionRef.current = null;
//     }
//     setIsListening(false);
//   }, []);

//   const startListening = useCallback(async () => {
//     setTranscript('');

//     try {
//       // const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');

//       // Запрос разрешений
//       // const status = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
//       // if (!status.granted) {
//       //   Alert.alert(
//       //     'Нет доступа',
//       //     'Разрешите доступ к микрофону в настройках приложения',
//       //   );
//       //   return;
//       // }

//       // Создаём распознаватель
//       // const recognition = new ExpoWebSpeechRecognition();
//       recognitionRef.current = recognition;

//       recognition.lang = 'ru-RU';
//       recognition.continuous = false;
//       recognition.interimResults = true;

//       // Подписываемся на события через нативный модуль
//       // (хук useSpeechRecognitionEvent уже подписан)

//       // Запускаем распознавание
//       recognition.start();

//       setIsListening(true);
//     } catch (e) {
//       console.error('Failed to start speech recognition:', e);
//       setIsListening(false);
//       Alert.alert(
//         'Голосовой ввод недоступен',
//         'Проверьте, что приложение имеет доступ к микрофону.\n\n' +
//         'Для голосового ввода нужна development-сборка (npx expo run:android / run:ios).\n\n' +
//         'Пока используйте текстовый ввод ниже — на клавиатуре есть кнопка 🎤 для диктовки.',
//       );
//     }
//   }, []);

//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (e) {
//         // ignore
//       }
//     }
//     setIsListening(false);
//   }, []);

//   const handleProcess = useCallback(async () => {
//     if (!transcript.trim()) {
//       Alert.alert('Пустой текст', 'Скажите что-нибудь или введите текст вручную');
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       const result = await aiService.parseVoice(transcript.trim());
//       onResult(result);
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Ошибка распознавания';
//       console.error('AI voice parse error:', error);
//       onError?.(message);
//       Alert.alert('Ошибка', 'Не удалось распознать транзакцию. Попробуйте ещё раз.');
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [transcript, onResult, onError]);

//   return (
//     <RNModal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
//       <View className="flex-1 bg-[rgba(0,0,0,0.7)] justify-end">
//         <Pressable className="flex-1" onPress={onClose} />

//         <View
//           className="bg-[#13131A] rounded-t-3xl"
//           style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}
//         >
//           <View className="w-9 h-1 bg-[#3A3A3C] rounded-full self-center mt-2 mb-3" />

//           {/* Заголовок */}
//           <View className="px-4 mb-4 flex-row items-center justify-between">
//             <View className="flex-row items-center gap-2">
//               <Text className="text-2xl">🎤</Text>
//               <Text bold className="text-lg text-white">Голосовой ввод</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} className="px-3 py-1">
//               <Text className="text-[#8E8E93]">Закрыть</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Индикатор listening */}
//           {isListening && (
//             <View className="px-4 mb-3">
//               <View className="flex-row items-center gap-2 bg-[rgba(99,102,241,0.1)] rounded-xl px-4 py-2.5">
//                 <View className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
//                 <Text className="text-sm text-[#6366F1]">Слушаю...</Text>
//               </View>
//             </View>
//           )}

//           {/* Распознанный текст */}
//           <View className="px-4 mb-4">
//             <View className="bg-[rgba(255,255,255,0.05)] rounded-2xl p-4 min-h-[120px]">
//               {transcript ? (
//                 <Text className="text-white text-base leading-6">{transcript}</Text>
//               ) : !isListening ? (
//                 <Text className="text-[#8E8E93] text-base leading-7">
//                   Нажмите 🎤 и скажите, например:{'\n'}
//                   {'\n'}«Потратил 500 рублей на продукты»{'\n'}
//                   «Зарплата 50000»{'\n'}
//                   «Такси 350 рублей»{'\n'}
//                   {'\n'}Или введите текст вручную ниже 👇
//                 </Text>
//               ) : null}
//             </View>
//           </View>

//           {/* Текстовый ввод (фоллбэк / корректировка) */}
//           <View className="px-4 mb-4">
//             <TextInput
//               value={transcript}
//               onChangeText={setTranscript}
//               placeholder="Или введите текст вручную..."
//               placeholderTextColor="#8E8E93"
//               className="bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 text-white text-sm"
//               multiline
//               maxLength={500}
//             />
//           </View>

//           {/* Кнопки */}
//           <View className="flex-row px-4 gap-3">
//             {/* Кнопка микрофона */}
//             <TouchableOpacity
//               onPress={isListening ? stopListening : startListening}
//               className="w-16 h-14 rounded-2xl items-center justify-center"
//               style={{
//                 backgroundColor: isListening ? 'rgba(255,59,48,0.15)' : 'rgba(99,102,241,0.15)',
//               }}
//             >
//               <Text className="text-2xl">{isListening ? '⏹' : '🎤'}</Text>
//             </TouchableOpacity>

//             {/* Кнопка отправки в DeepSeek */}
//             <TouchableOpacity
//               onPress={handleProcess}
//               disabled={isProcessing || !transcript.trim()}
//               className="flex-1 py-4 rounded-2xl items-center justify-center"
//               style={{
//                 backgroundColor:
//                   !transcript.trim() || isProcessing
//                     ? 'rgba(255,255,255,0.1)'
//                     : '#6366F1',
//                 opacity: isProcessing ? 0.6 : 1,
//               }}
//             >
//               <Text bold className="text-sm text-white">
//                 {isProcessing ? 'Обработка...' : '🤖 Распознать'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </RNModal>
//   );
// }

// // Кнопка для вставки в UI
// export function VoiceInputButton({
//   onResult,
//   onError,
// }: {
//   onResult: (result: AiTransactionResult) => void;
//   onError?: (error: string) => void;
// }) {
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <>
//       <TouchableOpacity
//         onPress={() => setShowModal(true)}
//         className="items-center gap-1"
//       >
//         <View className="w-12 h-12 rounded-full items-center justify-center bg-[rgba(99,102,241,0.1)]">
//           <Text className="text-xl">🎤</Text>
//         </View>
//         <Text className="text-xs text-[#8E8E93]">Голос</Text>
//       </TouchableOpacity>

//       <VoiceInputModal
//         visible={showModal}
//         onClose={() => setShowModal(false)}
//         onResult={(result) => {
//           setShowModal(false);
//           onResult(result);
//         }}
//         onError={onError}
//       />
//     </>
//   );
// }