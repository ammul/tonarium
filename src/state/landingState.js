import { ref } from 'vue'

// Set this before navigating to 'home' to tell LandingPage which sub-view to open.
export const requestedLandingView = ref(null)

// Reflects which sub-view LandingPage is currently showing ('jam', 'learn', or null for hero).
export const activeLandingView = ref(null)
