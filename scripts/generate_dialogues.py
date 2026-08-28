import asyncio
import os
import edge_tts

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "audio", "dialogues")
os.makedirs(OUTPUT_DIR, exist_ok=True)

DIALOGUES = {
    "hi": [
        {
            "id": "hi_turn_0",
            "voice": "en-IN-NeerjaNeural",
            "text": "Namaste! You've reached Apex Operations. I noticed you called our main line — how can I help you today?"
        },
        {
            "id": "hi_turn_1",
            "voice": "en-IN-PrabhatNeural",
            "text": "Haanji, I had a consultation on Tuesday and had a quick question. Can I book a follow-up with Doctor Sarah for Friday?"
        },
        {
            "id": "hi_turn_2",
            "voice": "en-IN-NeerjaNeural",
            "text": "I see your account, Aarav. Doctor Sarah has an opening tomorrow, Friday at 11:30 AM or 3:00 PM. Which works best for you?"
        },
        {
            "id": "hi_turn_3",
            "voice": "en-IN-PrabhatNeural",
            "text": "Friday 11:30 AM is perfect, thank you so much."
        },
        {
            "id": "hi_turn_4",
            "voice": "en-IN-NeerjaNeural",
            "text": "Confirmed! Your slot with Doctor Sarah for Friday 11:30 AM is locked in. I've dispatched an SMS confirmation to your mobile."
        }
    ],
    "ne": [
        {
            "id": "ne_turn_0",
            "voice": "ne-NP-HemkalaNeural",
            "text": "नमस्ते विकास जी! वेस्टसाइड सर्भिसबाट बोलिरहेको छु। तपाईंको वार्षिक रिभ्युको समय भएको छ।"
        },
        {
            "id": "ne_turn_1",
            "voice": "ne-NP-SagarNeural",
            "text": "हजुर, मैले रिभ्यु गर्नु पर्ने थियो। कहिले आउन मिल्छ कन्सलटेसन को लागि?"
        },
        {
            "id": "ne_turn_2",
            "voice": "ne-NP-HemkalaNeural",
            "text": "डाक्टर मार्कस सँग आइतबार दुई बजे समय खाली छ। तपाईंलाई मिल्छ?"
        },
        {
            "id": "ne_turn_3",
            "voice": "ne-NP-SagarNeural",
            "text": "हुन्छ, आइतबार दुई बजे कन्फर्म गरिदिनुस्।"
        },
        {
            "id": "ne_turn_4",
            "voice": "ne-NP-HemkalaNeural",
            "text": "डन! तपाईंको कन्सलटेसन आइतबार दुई बजे कन्फर्म भयो। एसएमएस रसिद पठाइदिएको छु।"
        }
    ],
    "es": [
        {
            "id": "es_turn_0",
            "voice": "es-ES-ElviraNeural",
            "text": "Hola Carlos, has llamado a la línea de soporte prioritario de Apex. ¿En qué te puedo asistir hoy?"
        },
        {
            "id": "es_turn_1",
            "voice": "es-ES-AlvaroNeural",
            "text": "Hola Sarah, necesito asistencia urgente con mi cuenta de operaciones empresariales."
        },
        {
            "id": "es_turn_2",
            "voice": "es-ES-ElviraNeural",
            "text": "Entendido Carlos. He registrado los detalles y enviado una alerta prioritaria a nuestro director de guardia."
        },
        {
            "id": "es_turn_3",
            "voice": "es-ES-AlvaroNeural",
            "text": "Muchas gracias Sarah por la rápida respuesta."
        },
        {
            "id": "es_turn_4",
            "voice": "es-ES-ElviraNeural",
            "text": "De nada Carlos, nuestro director te contactará en menos de dos minutos."
        }
    ]
}

async def generate_audio():
    print(f"Generating studio-grade neural dialogue audio into {OUTPUT_DIR}...")
    for lang, turns in DIALOGUES.items():
        for turn in turns:
            out_file = os.path.join(OUTPUT_DIR, f"{turn['id']}.mp3")
            print(f"Generating {turn['id']} ({turn['voice']})...")
            communicate = edge_tts.Communicate(turn['text'], turn['voice'])
            await communicate.save(out_file)
            size = os.path.getsize(out_file)
            print(f"  [OK] Saved {turn['id']}.mp3 ({size} bytes)")
    print("\nSUCCESS: All 15 neural conversation audio files generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate_audio())
