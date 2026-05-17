# Funkční požadavky 

## FR-01 
Robot musí být schopen načíst G-code

## FR-02
Robot musí být schopen interpretovat příkazy:
G0, G1, G2, G3, G4, G20, G21, G90, G91, M3, M5 a M30

## FR-03
Robot musí být schopen:
-   jet dopředu
-   otočit se
-   jet po kružnici různé délky

## FR-04
Robot musí znát svou relativní pozici vůči startovnímu bodu

## FR-05
Robot musí být schopen zvednout nebo spustit pero

## FR-06
Robot loguje svůj postup, kdy vytvořil nový příkaz, a kdy načetl nový příkaz


# Nefunkční požadavky

## NFR-01
Robot používá vlastní PWM na otáčení po kružnici

## NFR-02
Robot jede stálou konstantní rychlostí

## NFR-03
Robot nereaguje na změny rychlosti pomocí příkazu F(hodnota)

## NFR-04
Přesnost robota závisí na fyzických přednastavených parametrech

## NFR-05
Robot nemá žádnou zpětnou vazbu od kol


# Závistlosti

## MakeCode runtime
-   `basic.forever()`   - hlavní smyčka programu
-   `basic.pause()`     - čekání, při pohybu s PWM, nebo při pohybu s servo motory
-   `control.millis()`  - aktuální čas od zapnutí robota, v milisekundách

## Magicbit-PCA9685 - extension
-   `PCAmotor.StepperStart()`   - zahájení rotace daného motoru, daným směrem
-   `PCAmotor.StepperStop()`    - ukončení rotace daného motoru
-   `PCAmotor.Steppers`         - enum výběr motoru (levý nebo pravý)
-   `ServoHelper.createServo()` - vytvoření objektu serva
-   `Servo.down()`              - vysunutí serva nahoru
-   `Servo.up()`                - zasunutí serva dolu