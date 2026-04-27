import { memo } from 'react'
import { m } from 'framer-motion'

import { Poster } from '@/common'
import { mainHeading, maxWidth, paragraph } from '@/styles'
import type { ITrack } from '@/types'
import { cn } from '@/utils/helper'
import { useMotion } from '@/hooks/useMotion'

const HeroSlide = ({ track }: { track: ITrack }) => {
  const { fadeDown, staggerContainer } = useMotion()

  const { overview, original_title: title, poster_path: posterPath } = track

  return (
    <div
      className={cn(maxWidth, ` mx-auto flex items-center h-full  flex-row lg:gap-32 sm:gap-20`)}
    >
      <m.div
        variants={staggerContainer(0.2, 0.3)}
        initial="hidden"
        animate="show"
        className="text-gray-300 sm:max-w-[80vw] max-w-[90vw]  md:max-w-[420px] font-nunito flex flex-col sm:gap-5 xs:gap-3 gap-[10px] sm:mb-8"
      >
        <m.h2 variants={fadeDown} className={cn(mainHeading)}>
          {title}
        </m.h2>
        <m.p variants={fadeDown} className={paragraph}>
          {overview.length > 180 ? `${overview.substring(0, 180)}...` : overview}
        </m.p>
      </m.div>

      <Poster title={title} posterPath={posterPath} className="mr-auto" />
    </div>
  )
}

export default memo(HeroSlide)
