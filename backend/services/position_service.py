from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.position import Position
from schemas.position_schemas import PositionCreate


async def get_all_position(session: AsyncSession):
    result = await session.execute(select(Position))
    return result.scalars().all()


async def get_position_by_id(position_id: UUID, session: AsyncSession):
    position = await session.get(Position, position_id)

    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    return position


async def create_position(position_create: PositionCreate, session: AsyncSession):
    position = Position(name=position_create.name, parameters=position_create.parameters)
    session.add(position)
    await session.commit()
    await session.refresh(position)
    return position

async def delete_position_by_id(position_id: UUID, session: AsyncSession):
    position = await session.get(Position, position_id)
    if position is None:
        raise HTTPException(status_code=404, detail="Position not found")
    await session.delete(position)
    await session.commit()
