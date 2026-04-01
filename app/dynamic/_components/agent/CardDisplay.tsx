import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../../../hooks/useAgentInteraction';
import { Flashcard } from '../flashcard/Flashcard';

interface CardDisplayProps {
    cards: ChatMessage[];
}

export const CardDisplay = ({ cards }: CardDisplayProps) => {
    if (cards.length === 0) return null;

    const validCards = cards.filter((card): card is ChatMessage & { cardData: NonNullable<ChatMessage['cardData']> } =>
        card && card.cardData !== undefined && card.cardData.title !== undefined
    );
    if (validCards.length === 0) return null;

    const latestFlashcardId = validCards[validCards.length - 1].id;
    const count = validCards.length;

    let gridClasses = "grid w-full auto-rows-max items-start gap-4 md:gap-6 mx-auto ";
    if (count === 1) {
        gridClasses += "grid-cols-1 max-w-[min(92vw,60rem)]";
    } else if (count === 2) {
        gridClasses += "grid-cols-1 md:grid-cols-2 max-w-5xl";
    } else if (count === 3) {
        gridClasses += "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-7xl";
    } else if (count === 4) {
        gridClasses += "grid-cols-1 md:grid-cols-2 max-w-5xl";
    } else {
        gridClasses += "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-[95vw] xl:max-w-screen-2xl";
    }

    return (
        <div className="relative flex w-full flex-col items-center">
            <motion.div
                layout
                className={`relative z-10 px-4 md:px-8 ${gridClasses}`}
            >
                <AnimatePresence mode="popLayout">
                    {validCards.map((card) => {
                        const hasMedia = Boolean(
                            card.cardData?.media?.query ||
                            (card.cardData?.media?.urls && card.cardData.media.urls.length > 0)
                        );

                        const itemClass = "flex w-full self-start items-start";

                        // Determine internal Flashcard layout based on grid context — NOT from backend
                        let layoutProp: 'default' | 'horizontal' = 'default';
                        if (count === 1 && hasMedia) {
                            layoutProp = 'horizontal';
                        }

                        // Smoother liquid animation flow without hardcoded delays
                        return (
                            <motion.div
                                layout
                                key={card.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{
                                    opacity: 1, y: 0, scale: 1,
                                    transition: {
                                        type: "spring",
                                        stiffness: 160,
                                        damping: 20,
                                        mass: 0.8
                                    }
                                }}
                                exit={{ opacity: 0, scale: 0.85, y: -20, transition: { duration: 0.3, ease: "easeOut" } }}
                                // Fluidly reposition remaining items when grid changes
                                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                                className={itemClass}
                            >
                                <Flashcard
                                    {...card.cardData}
                                    layout={layoutProp}
                                    card_index={card.cardData?.card_index ?? 0}
                                    layoutId={card.id}
                                    shouldStreamText={card.id === latestFlashcardId}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {validCards.length > 4 && (
                <div className="mt-4 md:mt-6 flex items-center gap-2 rounded-full bg-white/40 px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-xl ring-1 ring-black/5 shadow-lg">
                    <div className="flex gap-1 md:gap-1.5">
                        {validCards.slice(-5).map((_, idx) => (
                            <motion.div
                                key={idx}
                                layoutId={`dot-${idx}`}
                                className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-zinc-400"
                            />
                        ))}
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-zinc-600">
                        {validCards.length} Cards
                    </span>
                </div>
            )}
        </div>
    );
};
