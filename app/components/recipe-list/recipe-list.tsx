'use client'

import Link from 'next/link'
import Image from 'next/image'

import { Recipe } from '../../types/recipe'

interface RecipeListProps {
    recipes: Recipe[]
    limit: number
    onLoadMore: () => void
    hasMore: boolean
    loadingMore: boolean
}

export default function RecipeList({ recipes, limit, onLoadMore, hasMore, loadingMore }: RecipeListProps) {
    return (
        <>
            <ul className="list-none md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {recipes.map((recipe) => {
                    const recipeSlug = recipe.name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\s-]/g, '')  // Remove all non-alphanumeric characters except spaces and hyphens
                        .replace(/\s+/g, '-')

                    const recipeTotalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes

                    return (
                        <li key={recipe.id} className="mb-4 md:mb-0 flex flex-col">
                            <Link href={`recipes/${recipeSlug}`} className="bg-white rounded-lg border border-border--light p-4 flex flex-col h-full hover:shadow-md transition-shadow">
                                <Image src={recipe.image}
                                       alt={recipe.name}
                                       loading={(recipe.id <= limit/2) ? 'eager' : 'lazy'}
                                       width={100}
                                       height={100}
                                       quality={90}
                                       style={{ objectFit: 'cover' }}
                                       className="relative w-full h-64"
                                />
                                <h3 className="font-primary text-xl font-semibold pt-4">{recipe.name}</h3>

                                <p className="inline-flex items-end font-primary text-sm pt-2">
                                    <span>{recipe.rating}</span>

                                    {/* Integrate dynamic stars icons based on rating number */}
                                    <span className="pl-2 pr-2">
                                        {Array.from({ length: 5 }).map((_, index) => {
                                            const rating = recipe.rating || 0

                                            // Determine fill level for this specific star (0 = empty, 1 = full, decimal = partial)
                                            const fillLevel = Math.max(0, Math.min(1, rating - index))
                                            const fillPercent = `${fillLevel * 100}%`

                                            // NOTE: Using recipe.id here to ensure each recipe card gradientId is truly unique -
                                            //      this affects proper filling of star icons based on rating
                                            const gradientId = `star-grad-${recipe.id}-${index}`

                                            return (
                                                <svg
                                                    key={index}
                                                    className="inline size-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <defs>
                                                        {/* Dynamic gradient that creates a hard color-stop matching the decimal remainder */}
                                                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset={fillPercent} stopColor="rgb(253, 224, 71)" /> {/* fill-yellow-300 */}
                                                            <stop offset={fillPercent} stopColor="rgb(255, 255, 255)" /> {/* white (to match recipe card background) */}
                                                        </linearGradient>
                                                    </defs>

                                                    {/* Underlay / Background path so empty/partial sections show a soft background */}
                                                    <path
                                                        className="fill-neutral-100"
                                                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                                                    />

                                                    {/* Foreground path applying the dynamic gradient fill */}
                                                    <path
                                                        fill={`url(#${gradientId})`}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                                                    />
                                                </svg>
                                            )
                                        })}
                                    </span>

                                    <span>({recipe.reviewCount})</span>
                                </p>
                                <p className="font-primary pt-2">
                                    <span className="pr-1">{recipe.cuisine}</span>|<span className="pl-1">{recipe.difficulty}</span>
                                </p>
                                <p className="font-primary pt-2 text-sm text-text--secondary">{recipeTotalTime} min.</p>
                            </Link>
                        </li>
                    )
                })}
            </ul>

            {hasMore && (
                <button type="button"
                        className="bg-btn--yellow rounded rounded-lg font-primary font-semibold text-center cursor-pointer w-full xl:w-1/2 xl:block xl:mx-auto p-2 mt-6 md:mt-10 hover:brightness-125 focus:brightness-125"
                        onClick={onLoadMore}
                        disabled={loadingMore}
                >
                    {loadingMore ? 'Loading...' : 'Load more'}
                </button>
            )}
        </>
    )
}