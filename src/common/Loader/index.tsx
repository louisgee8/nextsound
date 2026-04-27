import type { FC } from 'react'
import { memo } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { useMediaQuery } from 'usehooks-ts'

import { useTheme } from '@/context/themeContext'
import { cn } from '@/utils/helper'

interface SkelatonLoaderProps {
  className?: string
  isMoviesSliderLoader?: boolean
}

export const SkelatonLoader: FC<SkelatonLoaderProps> = memo(
  ({ className, isMoviesSliderLoader = true }) => {
    const { theme } = useTheme()
    const isThemeLight = theme === 'Light'

    const isScreenSmall = useMediaQuery('(max-width: 380px)')

    const classNames = cn(
      isMoviesSliderLoader
        ? `flex flex-row items-center gap-[15px] overflow-hidden `
        : `flex flex-row flex-wrap items-center xs:gap-4 gap-[14px] justify-center `,
      className,
    )

    const arrSize = isMoviesSliderLoader ? Math.floor(window.innerWidth / 170) + 1 : 10

    return (
      <SkeletonTheme
        baseColor={isThemeLight ? '#f5f5f5' : '#333'}
        highlightColor={isThemeLight ? '#eee' : '#444'}
      >
        <div className={classNames}>
          {Array.from({ length: arrSize }).map((_item, index) => {
            return (
              <div key={index} className={`${!isMoviesSliderLoader ? 'mb-6' : ''}`}>
                <Skeleton height={isScreenSmall ? 216 : 250} width={170} />
                <div className="text-center">
                  <Skeleton className="xs:mt-4 mt-3 w-[80%] " />
                </div>
              </div>
            )
          })}
        </div>
      </SkeletonTheme>
    )
  },
)

export const Loader = memo(() => {
  return (
    <div className="relative dark:bg-leather bg-paper top-0 left-0 w-screen h-screen flex justify-center items-center">
      <div className="loader" />
    </div>
  )
})

// Detail page skeleton loader
export const DetailPageLoader: FC = memo(() => {
  const { theme } = useTheme()
  const isThemeLight = theme === 'Light'
  const isScreenSmall = useMediaQuery('(max-width: 380px)')
  const isScreenMedium = useMediaQuery('(max-width: 768px)')

  return (
    <SkeletonTheme
      baseColor={isThemeLight ? '#f5f5f5' : '#333'}
      highlightColor={isThemeLight ? '#eee' : '#444'}
    >
      {/* Hero Section Skeleton */}
      <section className="w-full bg-sand dark:bg-leather-elevated">
        <div className="max-w-[1200px] mx-auto px-4 lg:py-36 sm:py-[136px] sm:pb-28 xs:py-28 xs:pb-12 pt-24 pb-8 flex flex-row lg:gap-12 md:gap-10 gap-8 justify-center">
          {/* Poster Skeleton */}
          <div className="shrink-0">
            <Skeleton
              height={isScreenSmall ? 216 : isScreenMedium ? 280 : 340}
              width={isScreenSmall ? 144 : isScreenMedium ? 187 : 227}
              className="rounded-lg"
            />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 max-w-[520px]">
            {/* Title */}
            <Skeleton height={isScreenSmall ? 24 : 32} className="mb-4" />
            <Skeleton height={isScreenSmall ? 24 : 32} width="60%" className="mb-6" />

            {/* Genre Pills */}
            <div className="flex flex-row gap-2 mb-6">
              <Skeleton height={24} width={60} className="rounded-full" />
              <Skeleton height={24} width={80} className="rounded-full" />
              <Skeleton height={24} width={70} className="rounded-full" />
            </div>

            {/* Overview */}
            <div className="space-y-2 mb-6">
              <Skeleton height={16} />
              <Skeleton height={16} />
              <Skeleton height={16} width="80%" />
            </div>

            {/* Cast */}
            <div>
              <Skeleton height={20} width={100} className="mb-3" />
              <div className="flex flex-row gap-3">
                <Skeleton height={40} width={40} className="rounded-full" />
                <Skeleton height={40} width={40} className="rounded-full" />
                <Skeleton height={40} width={40} className="rounded-full" />
                <Skeleton height={40} width={40} className="rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section Skeleton */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <Skeleton height={24} width={200} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton height={180} className="rounded-lg" />
            <Skeleton height={180} className="rounded-lg" />
            <Skeleton height={180} className="rounded-lg" />
          </div>
        </div>
      </section>

      {/* Similar Content Section Skeleton */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <Skeleton height={24} width={250} className="mb-6" />
          <SkelatonLoader className="" isMoviesSliderLoader={true} />
        </div>
      </section>
    </SkeletonTheme>
  )
})
