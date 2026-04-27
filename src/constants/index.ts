import { FiSun } from 'react-icons/fi'
import { BsMoonStarsFill } from 'react-icons/bs'
import { AiOutlineHome } from 'react-icons/ai'

import type { ITheme, INavLink } from '../types'

export const navLinks: INavLink[] = [
  {
    title: 'home',
    path: '/',
    icon: AiOutlineHome,
  },
]

export const themeOptions: ITheme[] = [
  {
    title: 'Dark',
    icon: BsMoonStarsFill,
  },
  {
    title: 'Light',
    icon: FiSun,
  },
]

export const sections = [
  {
    title: 'Latest Hits',
    category: 'tracks',
    type: 'latest',
  },
]
