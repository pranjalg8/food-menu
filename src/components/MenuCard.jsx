import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, ExternalLink, Clock, Users, TrendingUp, CheckCircle2, Circle } from 'lucide-react';

const MenuCard = React.memo(({ dish, onRecipeClick, selectionMode = false, isSelected = false, onToggleSelect }) => {
    if (!dish) return null;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-green-400 bg-green-400/10';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10';
            case 'hard': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const hasEnrichedData = dish.description || dish.cookingTime || dish.tags?.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            onClick={selectionMode ? onToggleSelect : undefined}
            className={`relative bg-white/10 backdrop-blur-md border rounded-2xl overflow-hidden shadow-xl group ${selectionMode ? 'cursor-pointer' : ''
                } ${isSelected ? 'border-blue-400 border-2' : 'border-white/20'
                }`}
        >
            {/* Selection Checkbox Overlay */}
            {selectionMode && (
                <div className="absolute top-2 right-2 z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-white/20 backdrop-blur-sm'
                            }`}
                    >
                        {isSelected ? (
                            <CheckCircle2 size={24} className="text-white" />
                        ) : (
                            <Circle size={24} className="text-white/60" />
                        )}
                    </motion.div>
                </div>
            )}
            {/* Image Cover */}
            <div className="h-40 w-full relative overflow-hidden bg-gray-800">
                {dish.image ? (
                    <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <div className="fallback-icon hidden w-full h-full flex items-center justify-center text-white/20 absolute inset-0">
                    <Utensils size={48} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Badges */}
                <div className="absolute bottom-2 left-4 flex gap-2 flex-wrap">
                    {dish.type && (
                        <span className="text-xs font-bold uppercase tracking-wider bg-primary/80 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                            {dish.type}
                        </span>
                    )}
                    {dish.difficulty && hasEnrichedData && (
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-sm ${getDifficultyColor(dish.difficulty)}`}>
                            {dish.difficulty}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col min-h-[240px]">
                <h3 className="text-xl font-heading font-bold text-primary mb-2 line-clamp-1" title={dish.name}>
                    {dish.name}
                </h3>

                {/* Description - Fixed Height Container */}
                <div className="mb-3 h-10">
                    {dish.description ? (
                        <p className="text-sm text-gray-300 font-light line-clamp-2">
                            {dish.description}
                        </p>
                    ) : (
                        <div className="h-full" />
                    )}
                </div>

                {/* Cooking Info - Fixed Height Container */}
                <div className="mb-3 h-5">
                    {hasEnrichedData && (dish.cookingTime || dish.servings) && (
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            {dish.cookingTime && (
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{dish.cookingTime.total} min</span>
                                </div>
                            )}
                            {dish.servings && (
                                <div className="flex items-center gap-1">
                                    <Users size={14} />
                                    <span>{dish.servings}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tags - Fixed Height Container */}
                <div className="mb-3 min-h-[28px]">
                    {dish.tags && dish.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {dish.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions - Push to Bottom */}
                <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-3">
                    <div className="flex gap-2">
                        {dish.prep && (
                            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded flex items-center gap-1">
                                ⏳ Prep
                            </span>
                        )}
                    </div>

                    {dish.recipeUrl ? (
                        <a
                            href={dish.recipeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                            Recipe <ExternalLink size={14} />
                        </a>
                    ) : (
                        <span className="text-white/20 text-sm">No Link</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

MenuCard.displayName = 'MenuCard';

export default MenuCard;
