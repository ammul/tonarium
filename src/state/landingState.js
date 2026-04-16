import { ref } from 'vue'

// Set this before navigating to 'home' to tell LandingPage which sub-view to open.
export const requestedLandingView = ref(null)
