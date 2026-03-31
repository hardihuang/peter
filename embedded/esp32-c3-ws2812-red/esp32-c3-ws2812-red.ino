/*
 * ESP32-C3 WS2812 RGB LED Strip - Red Light
 * 
 * Hardware: ESP32-C3 DevKit
 * LED Strip: WS2812 (NeoPixel compatible)
 * 
 * Wiring:
 * - WS2812 Data  -> GPIO8 (or any digital pin)
 * - WS2812 VCC   -> 5V (or 3.3V depending on strip)
 * - WS2812 GND   -> GND
 * 
 * Note: ESP32-C3 uses 3.3V logic. Some WS2812 strips may need
 * a level shifter for reliable operation at 5V.
 */

#include <Adafruit_NeoPixel.h>

// Configuration
#define LED_PIN     8       // GPIO pin connected to WS2812 data
#define NUM_LEDS    30      // Number of LEDs in the strip
#define BRIGHTNESS  128     // Brightness (0-255)

// Create NeoPixel object
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  Serial.println("ESP32-C3 WS2812 LED Strip - Red");
  
  // Initialize the LED strip
  strip.begin();
  strip.setBrightness(BRIGHTNESS);
  
  // Set all LEDs to RED
  setAllRed();
  
  Serial.println("LEDs set to RED");
}

void loop() {
  // Rainbow animation - cycles through all colors
  rainbowCycle(20);  // 20ms delay between steps
}

// Set all LEDs to solid RED
void setAllRed() {
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(255, 0, 0));  // Red (R, G, B)
  }
  strip.show();
}

// Blink all LEDs red
void blinkRed(int delayMs) {
  // Turn on red
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(255, 0, 0));
  }
  strip.show();
  delay(delayMs);
  
  // Turn off
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(0, 0, 0));
  }
  strip.show();
  delay(delayMs);
}

// Set brightness (0-255)
void setStripBrightness(uint8_t brightness) {
  strip.setBrightness(brightness);
  strip.show();
}

// Gradient effect from dark red to bright red
void redGradient() {
  for (int i = 0; i < NUM_LEDS; i++) {
    int redValue = map(i, 0, NUM_LEDS - 1, 50, 255);
    strip.setPixelColor(i, strip.Color(redValue, 0, 0));
  }
  strip.show();
}

// Chase effect with red
void redChase(int wait) {
  for (int a = 0; a < 3; a++) {  // Repeat 3 times
    for (int b = 0; b < NUM_LEDS; b++) {
      strip.clear();
      
      // Set 3 LEDs in a chase pattern
      for (int c = b; c < b + 3 && c < NUM_LEDS; c++) {
        strip.setPixelColor(c, strip.Color(255, 0, 0));
      }
      
      strip.show();
      delay(wait);
    }
  }
}

// Rainbow cycle animation
void rainbowCycle(int wait) {
  for (long firstPixelHue = 0; firstPixelHue < 5 * 65536; firstPixelHue += 256) {
    for (int i = 0; i < NUM_LEDS; i++) {
      // Offset pixel hue by an amount to make one full rainbow cycle
      int pixelHue = firstPixelHue + (i * 65536L / NUM_LEDS);
      strip.setPixelColor(i, strip.gamma32(strip.ColorHSV(pixelHue)));
    }
    strip.show();
    delay(wait);
  }
}

// Static rainbow - all LEDs show different colors
void staticRainbow() {
  for (int i = 0; i < NUM_LEDS; i++) {
    int hue = map(i, 0, NUM_LEDS - 1, 0, 65535);
    strip.setPixelColor(i, strip.gamma32(strip.ColorHSV(hue)));
  }
  strip.show();
}

// Rainbow chase - moving rainbow across strip
void rainbowChase(int wait) {
  for (int j = 0; j < 256; j++) {
    for (int i = 0; i < NUM_LEDS; i++) {
      int hue = ((i * 256 / NUM_LEDS) + j) & 255;
      strip.setPixelColor(i, strip.ColorHSV(hue * 256, 255, 255));
    }
    strip.show();
    delay(wait);
  }
}
