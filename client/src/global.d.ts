export {}; // Makes this file a module

declare global {
  interface Window {
    google: any; // You can type it more strictly if desired
  }
}
