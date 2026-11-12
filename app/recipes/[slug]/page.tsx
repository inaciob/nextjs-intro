import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { Recipe } from '../../types/recipe'
import PrintButton from '../../components/print-button/print-button'

interface RecipePageProps {
    params: Promise<{ slug: string }>
}

// Helper function to match the slug generation logic from RecipeList
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')  // Remove all non-alphanumeric characters except spaces and hyphens
        .replace(/\s+/g, '-')
}

export default async function RecipePage({ params, }: RecipePageProps) {
    const { slug } = await params

    try {
        // 1. Fetch all recipes from DummyJSON to locate the matching numeric ID
        const listRes = await fetch('https://dummyjson.com/recipes?limit=50')
        const listData = await listRes.json()
        const recipes: Recipe[] = listData.recipes || []

        // 2. Find the recipe whose generated slug matches the route parameter slug
        const matchedRecipe = recipes.find((recipe: Recipe) => generateSlug(recipe.name) === slug)

        // If no matching recipe is found, trigger Next.js 404 page
        if (!matchedRecipe) {
            notFound()
        }

        // 3. Fetch the full detailed recipe using its numeric ID
        const detailRes = await fetch(`https://dummyjson.com/recipes/${matchedRecipe.id}`)
        const recipe = await detailRes.json()

        return (
            <main className="mx-auto max-w-9/10 xl:max-w-lg-custom py-10 font-primary">
                <div className="flex print:hidden justify-between xl:max-w-2/3">
                    <Link href="/" className="inline-block mb-6 text-base underline hover:text-gray-600">
                        Back to all recipes
                    </Link>

                    <PrintButton />
                </div>

                <div className="xl:flex xl:flex-row xl:justify-between xl:gap-x-6">
                    <div className="w-full xl:basis-2/3">
                        <div className="relative grid grid-cols-1 items-start md:inline-block print:hidden md:w-full">
                            <div className="w-80 md:w-96 absolute z-40 top-[calc(50%)] md:top-[calc(50%-30px)] left-[50%] translate-[-50%] text-center text-white">
                                <h1 className="text-2xl md:text-3xl font-bold font-primary mb-4">{recipe.name}</h1>

                                {/* Recipe Details */}
                                <p className="text-sm md:text-base text-white mb-4">
                                    <span className="pr-1">{recipe.cuisine}</span>|<span className="pl-1 capitalize">{recipe.difficulty}</span>
                                </p>
                                <div className="grid grid-cols-3 gap-1 text-sm md:text-base">
                                    <p className="inline">
                                        <strong>Prep:</strong> {recipe.prepTimeMinutes} min.
                                    </p>
                                    <p className="inline">
                                        <strong>Cook:</strong> {recipe.cookTimeMinutes} min.
                                    </p>
                                    <p className="inline">
                                        <strong>Serves:</strong> {recipe.servings}
                                    </p>
                                </div>
                            </div>

                            <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden border border-border--light">
                                <Image
                                    src={recipe.image}
                                    alt={recipe.name}
                                    fill
                                    style={{ objectFit: 'cover', filter: 'grayscale(50%) contrast(0.5)' }}
                                    priority
                                />
                            </div>
                        </div>

                        <div className="hidden print:block">
                            <h1 className="text-2xl md:text-3xl font-bold font-primary mb-4">{recipe.name}</h1>
                            <div className="grid grid-cols-3 gap-1 text-sm md:text-base">
                                <p className="inline">
                                    <strong>Prep:</strong> {recipe.prepTimeMinutes} min.
                                </p>
                                <p className="inline">
                                    <strong>Cook:</strong> {recipe.cookTimeMinutes} min.
                                </p>
                                <p className="inline">
                                    <strong>Serves:</strong> {recipe.servings}
                                </p>
                            </div>
                        </div>

                        <div className="md:grid md:grid-cols-2">
                            {/* Ingredients Section */}
                            <div className="pt-10 md:pt-6">
                                <h2 className="text-xl md:text-2xl font-bold mb-4">Ingredients</h2>
                                <ul className="list-disc list-outside pl-4 space-y-2 font-secondary">
                                    {recipe.ingredients?.map((ingredient: string, index: number) => (
                                        <li key={index}>{ingredient}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions Section */}
                            <div className="pt-6">
                                <h2 className="text-xl md:text-2xl font-bold mb-4">Instructions</h2>
                                <ol className="list-decimal list-outside pl-4 space-y-3 font-secondary">
                                    {recipe.instructions?.map((instruction: string, index: number) => (
                                        <li key={index} className="leading-relaxed">{instruction}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="w-full mt-10 xl:mt-0 pt-6 xl:pt-0 border-t border-border--light xl:border-none xl:basis-1/3 print:hidden">
                        <h2 className="text-xl font-semibold pb-4">Related recipes:</h2>

                        {/*
                            Get list of all related recipes matching assigned cuisine of the current recipe page as a primary criteria
                            and display in a simple card list. If no further recipes exist based on assigned cuisine/culture,
                            try to find other related recipes by meal type as a secondary criteria
                        */}

                        {(() => {
                            // Find other recipes with the same cuisine, excluding the current recipe
                            const relatedRecipesByCuisine = recipes.filter(
                                (item: Recipe) => item.cuisine === recipe.cuisine && item.id !== recipe.id
                            )

                            if (relatedRecipesByCuisine.length > 0) {
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                                        {relatedRecipesByCuisine.map((related: Recipe) => {
                                            const relatedSlug = generateSlug(related.name)

                                            return (
                                                <Link
                                                    key={related.id}
                                                    href={`/recipes/${relatedSlug}`}
                                                    className="flex items-center gap-4 bg-white p-4 rounded-lg border border-border--light hover:shadow-md transition-shadow"
                                                >
                                                    <div className="relative w-25 h-25 rounded-md overflow-hidden shrink-0">
                                                        <Image
                                                            src={related.image}
                                                            alt={related.name}
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-semibold">{related.name}</h3>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )
                            }
                            else {
                                // Find other recipes with the same meal type, excluding the current recipe
                                const relatedRecipesByMealType = recipes.filter(
                                    (item: Recipe) => (Array.isArray(item.mealType) && item.mealType[0] === recipe.mealType[0]) && item.id !== recipe.id
                                ).slice(0, 5) // Limit to top 5 related recipes by meal type

                                if (relatedRecipesByMealType.length > 0) {
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                                            {relatedRecipesByMealType.map((related: Recipe) => {
                                                const relatedSlug = generateSlug(related.name)

                                                return (
                                                    <Link
                                                        key={related.id}
                                                        href={`/recipes/${relatedSlug}`}
                                                        className="flex items-center gap-4 bg-white p-4 rounded-lg border border-border--light hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="relative w-25 h-25 rounded-md overflow-hidden shrink-0">
                                                            <Image
                                                                src={related.image}
                                                                alt={related.name}
                                                                fill
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-semibold">{related.name}</h3>
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )
                                }

                                return <p className="text-base">Sorry, no related recipes could be found.</p>
                            }
                        })()}
                    </div>
                </div>

                <Link href="/" className="inline-block print:hidden mt-10 text-base underline hover:text-gray-600">
                    Back to all recipes
                </Link>
            </main>
        )
    }
    catch (error) {
        console.error('Error loading individual recipe page: ', error)
        notFound()
    }
}