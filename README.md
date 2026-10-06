# Expo UI: a MaskedView laid over a Pressable cancels the press (Android)

## Summary

On Android, a `MaskedView` from `@expo/ui/community/masked-view` that covers a `Pressable`
cancels the press. `onPress` only fires for very short taps (about 30 ms or less). A normal tap
logs `pressIn`, `touchCancel`, `pressOut`, and no `press`. A plain responder `View` with the same
overlay is terminated even on short taps.

This is the usual way to draw gradient text or icons on a button, so those buttons feel flaky:
quick taps work, normal ones don't.

Setting `pointerEvents: 'none'` on the `MaskedView` works around it.

## Steps

1. `npm install`, then `npx expo run:android`.
2. Tap each button and watch the `[repro]` logs (Metro or `adb logcat -s ReactNativeJS`).

Each `Pressable` shows an `onPress` counter.

| Button | 30 ms tap | 200 ms tap |
| --- | --- | --- |
| 1. Plain `Pressable` | `press` | `press` |
| 2. `Pressable` + `MaskedView` | `press` | `touchCancel`, no `press` |
| 3. Same with `pointerEvents: 'none'` on the `MaskedView` | `press` | `press` |
| 4. Responder `View` + `MaskedView` | `terminate` | `terminate` |

Holds were sent with `adb shell input swipe x y x y <ms>`.

## Cause

1. When the `Pressable` (or any JS responder) is granted, React Native calls `setJSResponder`.
   From then on, `JSResponderHandler.onInterceptTouchEvent` makes the responder's native view
   intercept the stream, so Android sends `ACTION_CANCEL` to its children.
2. One of those children is the `MaskedView`'s `HostView`. Compose turns the cancel into a
   pointer cancel, and the interop view receives `ACTION_CANCEL`.
3. `TouchDispatchingRootViewGroup.dispatchTouchEvent` (`RNHostView.kt`) treats every
   `ACTION_CANCEL` as Compose claiming the gesture and calls
   `onChildStartedNativeGesture` on the ancestor React root. React Native cancels the JS
   responder, which is the `Pressable` the overlay belongs to.

Short taps survive because `ACTION_UP` arrives before `setJSResponder` reaches native.

## Environment

- expo 58.0.5, @expo/ui 58.0.13, react-native 0.88.0-rc.3
- New Architecture, debug build, Pixel 7a, Android 17
- The same code is in `@expo/ui` 57.0.21 and on `main`.
