'use client'

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'

import { Recipe } from '../../types/recipe'
import RecipeList from '../recipe-list/recipe-list'

interface RecipeContainerProps {
    initialRecipes: Recipe[]
    limit: number
}

export default function RecipeContainer({ initialRecipes, limit }: RecipeContainerProps) {
    const [allRecipes, setAllRecipes] = useState<Recipe[]>(initialRecipes)

    // Search & multi-select filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
    const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([])

    // Pagination state
    const [displayLimit, setDisplayLimit] = useState(limit)
    const [loadingMore, setLoadingMore] = useState(false)

    // Mobile filter visibility state (false = hidden, true = visible as overlay over recipe cards grid)
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

    // Scroll to top button visibility state
    const [showBtnScrollTop, setShowBtnScrollTop] = useState(false)

    // Ref to track the scroll position of the advanced filters area in order to address a scroll jumping issue
    const asideContainerRef = useRef<HTMLElement>(null)
    const scrollPosRef = useRef<number>(0)

    // Fetch full dataset on mount to populate checkboxes dynamically
    useEffect(() => {
        async function fetchAllRecipes() {
            try {
                const response = await fetch('https://dummyjson.com/recipes?limit=50&skip=0')
                const data = await response.json()
                if (data && data.recipes) {
                    setAllRecipes(data.recipes)
                }
            }
            catch (error) {
                console.error('Failed to fetch full recipe dataset: ', error)
            }
        }
        fetchAllRecipes()

        // Track window scroll position to conditionally show/hide the scroll to top button
        function handleWindowScroll() {
            // Show the scroll to top button once the user has scrolled at least half the page height
            if (window.scrollY > window.innerHeight / 2) {
                setShowBtnScrollTop(true)
            }
            else {
                setShowBtnScrollTop(false)
            }
        }

        window.addEventListener('scroll', handleWindowScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleWindowScroll)
    }, [])

    function handleScrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    // Dynamically extract unique options for checkboxes
    const availableCuisines = useMemo(() => {
        const cuisines = allRecipes.map(r => r.cuisine).filter(Boolean)
        return Array.from(new Set(cuisines)).sort()
    }, [allRecipes])

    const availableDifficulties = useMemo(() => {
        const difficulties = allRecipes.map(r => r.difficulty).filter(Boolean)
        return Array.from(new Set(difficulties)).sort()
    }, [allRecipes])

    const availableMealTypes = useMemo(() => {
        const mealTypes = allRecipes.flatMap(r => r.mealType || []).filter(Boolean)
        return Array.from(new Set(mealTypes)).sort()
    }, [allRecipes])

    // Checkbox toggle helper
    function handleCheckboxToggle(item: string, selectedList: string[], setSelectedList: React.Dispatch<React.SetStateAction<string[]>>) {
        if (asideContainerRef.current) {
            scrollPosRef.current = window.scrollY
        }

        if (selectedList.includes(item)) {
            setSelectedList(selectedList.filter(i => i !== item))
        }
        else {
            setSelectedList([...selectedList, item])
        }
    }

    // Restore the aside container's scroll position synchronously right after DOM mutation
    useLayoutEffect(() => {
        if (asideContainerRef.current) {
            asideContainerRef.current.scrollTop = scrollPosRef.current
        }
    }, [selectedCuisines, selectedDifficulties, selectedMealTypes])

    // Clear all advanced filters at once
    function handleClearFilters() {
        if (asideContainerRef.current) {
            asideContainerRef.current.scrollTop = 0
        }
        scrollPosRef.current = 0

        setSelectedCuisines([])
        setSelectedDifficulties([])
        setSelectedMealTypes([])
    }

    // Collapse expanded filters area on mobile/tablet when already opened (alternative to "x" icon in top corner)
    function handleCollapseFilters() {
        setIsMobileFiltersOpen(false)
    }

    // Effect to handle live search updates inline
    // Filter logic: Search query + multi-select checkbox filtering
    const filteredRecipes = useMemo(() => {
        return allRecipes.filter((recipe) => {
            const matchesSearch = searchQuery.trim() === '' ||
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (recipe.cuisine && recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCuisine = selectedCuisines.length === 0 || selectedCuisines.includes(recipe.cuisine)
            const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(recipe.difficulty)
            const matchesMealType = selectedMealTypes.length === 0 || (recipe.mealType && recipe.mealType.some((m: string) => selectedMealTypes.includes(m)))

            return matchesSearch && matchesCuisine && matchesDifficulty && matchesMealType
        })
    }, [allRecipes, searchQuery, selectedCuisines, selectedDifficulties, selectedMealTypes])

    // Reset pagination when filters change
    useEffect(() => {
        setDisplayLimit(limit)
    }, [searchQuery, selectedCuisines, selectedDifficulties, selectedMealTypes, limit])

    const paginatedRecipes = useMemo(() => {
        return filteredRecipes.slice(0, displayLimit)
    }, [filteredRecipes, displayLimit])

    const hasMore = paginatedRecipes.length < filteredRecipes.length

    async function handleLoadMore() {
        setLoadingMore(true)

        setTimeout(() => {
            setDisplayLimit(prev => prev + limit)
            setLoadingMore(false)
        }, 200)
    }

    const totalActiveFilters = selectedCuisines.length + selectedDifficulties.length + selectedMealTypes.length

    return (
        <div className="flex flex-col xl:flex-row gap-8 relative items-start">
            {/* Advanced filters sidebar/overlay */}
            <aside ref={asideContainerRef}
                className={`
                ${isMobileFiltersOpen ? 'absolute w-full inset-0 z-30 p-4 overflow-y-auto shadow-2xl border border-border--light' : 'hidden'}
                xl:w-1/4 xl:block xl:sticky xl:top-8 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto xl:p-4 xl:shadow-none xl:border-none bg-secondary-bg rounded-lg min-h-max xl:min-h-auto max-h-max
            `}>
                <div className="flex justify-between items-center xl:hidden border-border--light pb-4">
                    <button
                        type="button"
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="text-gray-500 font-bold text-xl cursor-pointer p-1"
                        aria-label="Close filters"
                    >
                        ✕
                    </button>
                </div>

                {/* Dynamically populated filter options */}
                <div className="space-y-6">
                    <div className="font-secondary text-base">
                        Advanced filters {totalActiveFilters > 0 && `(${totalActiveFilters} active)`}
                    </div>

                    {/* Cuisine Group */}
                    <div className="pb-0">
                        <h3 className="font-primary font-medium text-xl border-b mb-4">Cuisine</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            {availableCuisines.map((cuisine) => (
                                <label key={cuisine} className="flex items-center space-x-2 cursor-pointer text-sm font-primary">
                                    <input
                                        type="checkbox"
                                        value={cuisine}
                                        checked={selectedCuisines.includes(cuisine)}
                                        onChange={() => handleCheckboxToggle(cuisine, selectedCuisines, setSelectedCuisines)}
                                        className="rounded border-border--light text-black focus:ring-0 cursor-pointer"
                                    />
                                    <span className="font-secondary text-base">{cuisine}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Group */}
                    <div className="pb-0">
                        <h3 className="font-primary font-medium text-xl border-b mb-4">Difficulty</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            {availableDifficulties.map((diff) => (
                                <label key={diff} className="flex items-center space-x-2 cursor-pointer text-sm font-primary">
                                    <input
                                        type="checkbox"
                                        value={diff}
                                        checked={selectedDifficulties.includes(diff)}
                                        onChange={() => handleCheckboxToggle(diff, selectedDifficulties, setSelectedDifficulties)}
                                        className="rounded border-border--light text-black focus:ring-0 cursor-pointer"
                                    />
                                    <span className="font-secondary text-base">{diff}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Meal Type Group */}
                    <div className="pb-0 mb-0">
                        <h3 className="font-primary font-medium text-xl border-b mb-4">Meal type</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                            {availableMealTypes.map((meal) => (
                                <label key={meal} className="flex items-center space-x-2 cursor-pointer text-sm font-primary">
                                    <input
                                        type="checkbox"
                                        value={meal}
                                        checked={selectedMealTypes.includes(meal)}
                                        onChange={() => handleCheckboxToggle(meal, selectedMealTypes, setSelectedMealTypes)}
                                        className="rounded border-border--light text-black focus:ring-0 cursor-pointer"
                                    />
                                    <span className="font-secondary text-base">{meal}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={`flex ${totalActiveFilters > 0 ? 'justify-between' : 'justify-end'}`}>
                        {/* Clear Filters Button (Visible only when filters are active) */}
                        {totalActiveFilters > 0 && (
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="text-left underline font-secondary text-base cursor-pointer"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}

                        {/* Collapse Filters Button (Visible only on mobile and tablet) */}
                        <div className="xl:hidden pt-4">
                            <button
                                type="button"
                                onClick={handleCollapseFilters}
                                className="text-right underline font-secondary text-base cursor-pointer"
                            >
                                Collapse filters
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 w-full">
                {/* Search Bar & Filter Toggle Row */}
                <div className="flex flex-col sm:flex-row-reverse xl:flex-row gap-4 mb-6 items-center">
                    {/* NOTE: Relative container is for visually anchoring the clear button inside the search input field */}
                    <div className="relative w-full xl:w-96">
                        <input
                            type="text"
                            placeholder="Search by recipe name or cuisine"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-border--light rounded-lg px-4 py-2 w-full font-secondary"
                        />

                        {searchQuery &&
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 flex items-center p-4 text-gray-500 text-lg cursor-pointer"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        }
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg shrink-0 font-primary w-full sm:w-auto xl:hidden bg-secondary-bg border border-border--light cursor-pointer"
                    >
                        <span className="font-secondary text-base">
                            Advanced filters {totalActiveFilters > 0 && `(${totalActiveFilters} active)`}
                        </span>

                        {/* NOTE: SVG originally from https://heroicons.com */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>
                        </svg>
                    </button>
                </div>

                {/* Results count indicator matching Figma */}
                <div className="flex justify-between items-center mb-6">
                    <p className="font-secondary text-base">
                        {filteredRecipes.length} recipes found
                    </p>
                </div>

                {/* Recipe Grid List */}
                <RecipeList recipes={paginatedRecipes}
                            limit={limit}
                            onLoadMore={handleLoadMore}
                            hasMore={hasMore}
                            loadingMore={loadingMore}
                />

                {/* Scroll Back to Top Button */}
                {showBtnScrollTop && (
                    <button
                        type="button"
                        onClick={handleScrollToTop}
                        className="fixed bottom-2 xl:bottom-6 right-6 p-4 z-40 bg-sky-600 rounded-full shadow-lg hover:bg-sky-400 focus:ring-1 focus:ring-black cursor-pointer transition-all"
                        aria-label="Scroll back to top"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}