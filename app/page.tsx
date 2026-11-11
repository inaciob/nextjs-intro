import { Suspense } from 'react';
import Loading from './loading'
import RecipeContainer from './components/recipe-container/recipe-container'

export default async function Home() {
    const RESULTS_LIMIT = 12

    // Fetch initial recipes on the server
    const data = await fetch(`https://dummyjson.com/recipes?limit=${RESULTS_LIMIT}&skip=0`)
    const response = await data.json()
    const initialRecipes = response ? response.recipes : []

    return (
        <main className="mx-auto max-w-9/10 xl:max-w-lg-custom py-10">
            <Suspense fallback={<Loading/>}>
                <RecipeContainer initialRecipes={initialRecipes} limit={RESULTS_LIMIT} />
            </Suspense>
        </main>
    )
}