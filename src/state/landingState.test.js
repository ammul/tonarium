import { describe, it, expect, beforeEach } from 'vitest'
import { requestedLandingView, activeLandingView } from './landingState.js'

describe('landingState', () => {
  beforeEach(() => {
    requestedLandingView.value = null
    activeLandingView.value = null
  })

  it('requestedLandingView defaults to null', () => {
    expect(requestedLandingView.value).toBeNull()
  })

  it('activeLandingView defaults to null', () => {
    expect(activeLandingView.value).toBeNull()
  })

  it('requestedLandingView can be set to jam', () => {
    requestedLandingView.value = 'jam'
    expect(requestedLandingView.value).toBe('jam')
  })

  it('activeLandingView can be set to learn', () => {
    activeLandingView.value = 'learn'
    expect(activeLandingView.value).toBe('learn')
  })

  it('the two refs are independent', () => {
    requestedLandingView.value = 'jam'
    expect(activeLandingView.value).toBeNull()
  })
})
