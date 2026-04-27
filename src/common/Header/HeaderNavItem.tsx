import { NavLink } from 'react-router-dom'
import { textColor as _textColor } from '../../styles'
import { cn } from '../../utils/helper'

interface HeaderProps {
  link: { title: string; path: string }
  isNotFoundPage: boolean
  showBg: boolean
}

const HeaderNavItem = ({ link, showBg, isNotFoundPage }: HeaderProps) => {
  return (
    <li>
      <NavLink
        to={link.path}
        className={({ isActive }) => {
          return cn(
            'nav-link',
            isActive
              ? ` active ${showBg ? 'text-black dark:text-white' : `text-white`}`
              : ` ${
                  isNotFoundPage || showBg
                    ? 'text-[#444] dark:text-white dark:hover:text-gray-300 hover:text-black'
                    : 'text-gray-300 hover:text-sec-color'
                }`,
          )
        }}
        end
      >
        {link.title}
      </NavLink>
    </li>
  )
}

export default HeaderNavItem
