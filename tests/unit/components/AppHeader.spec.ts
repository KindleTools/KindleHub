import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import AppHeader from '../../../src/components/layout/AppHeader.vue'

// Mock icons to avoid rendering issues and simplify tests
vi.mock('lucide-vue-next', () => ({
  Moon: { template: '<span data-testid="icon-moon" />' },
  Sun: { template: '<span data-testid="icon-sun" />' },
  Menu: { template: '<span data-testid="icon-menu" />' }
}))

// Mock VueUse
const mockUseDark = vi.fn()
const mockUseToggle = vi.fn()

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en' }
  })
}))

vi.mock('@vueuse/core', () => ({
  useDark: () => mockUseDark(),
  useToggle: () => mockUseToggle
}))

describe('AppHeader.vue', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: 'Home' } },
      { path: '/library', component: { template: 'Library' } },
      { path: '/import', component: { template: 'Import' } }
    ]
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDark.mockReturnValue(false) // Default to light mode
  })

  it('renders the logo', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const logo = wrapper.find('img')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toBe('/icon.png')
    expect(logo.attributes('alt')).toBe('Kindle Hub')
  })

  it('renders navigation links', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const links = wrapper.findAll('a[href]')
    // 1 for Logo, 3 for nav items (Home, Library, Import)
    expect(links.length).toBeGreaterThanOrEqual(4)
    expect(wrapper.text()).toContain('nav.home')
    expect(wrapper.text()).toContain('nav.library')
    expect(wrapper.text()).toContain('nav.import')
  })

  it('toggles dark mode when button is clicked', async () => {
    mockUseDark.mockReturnValue(false) // Light mode
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(mockUseToggle).toHaveBeenCalled()
  })

  it('displays correct icon based on theme', async () => {
    // Light mode
    mockUseDark.mockReturnValue(false)
    let wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    expect(wrapper.find('[data-testid="icon-moon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="icon-sun"]').exists()).toBe(false)

    // Dark mode
    mockUseDark.mockReturnValue(true)
    wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        mocks: {
          $t: (key: string) => key
        }
      }
    })
    expect(wrapper.find('[data-testid="icon-moon"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="icon-sun"]').exists()).toBe(true)
  })

  it('toggles mobile menu', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        stubs: {
          MobileMenu: {
            name: 'MobileMenu',
            template: '<div data-testid="mobile-menu" />',
            props: ['isOpen']
          }
        },
        mocks: {
          $t: (key: string) => key
        }
      }
    })

    const menuButton = wrapper.find('button[aria-label="nav.menu"]')
    expect(menuButton.exists()).toBe(true)

    const mobileMenu = wrapper.findComponent({ name: 'MobileMenu' })
    expect(mobileMenu.exists()).toBe(true)
    expect(mobileMenu.props('isOpen')).toBe(false)

    await menuButton.trigger('click')
    expect(mobileMenu.props('isOpen')).toBe(true)
  })
})
